const {
    Client,
    GatewayIntentBits,
    ChannelType,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ==============================
// BOT READY
// ==============================

client.once("ready", () => {
    console.log(`Bot online as ${client.user.tag}`);
});

// ==============================
// INTERACTIONS
// ==============================

client.on("interactionCreate", async (interaction) => {

    // ==============================
    // /setup-ticket
    // ==============================

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === "setup-ticket") {

            const embed = new EmbedBuilder()
                .setTitle("🎫 Family Ticket Support")
                .setDescription(
                    "Welcome to **Family Ticket Support**! 👋\n\n" +
                    "Please choose the type of support you need below.\n\n" +
                    "🖥️ **PC Optimization** — FPS, Windows and performance\n" +
                    "🎮 **MSI App Player** — Emulator and gaming support\n" +
                    "🔧 **PC Problems** — Errors, drivers and Windows problems\n" +
                    "💬 **General Support** — General questions and help\n" +
                    "🛒 **Purchase / Services** — Services and orders\n\n" +
                    "🔒 **Private:** Only you and support staff can see your ticket.\n" +
                    "⚡ **Fast:** Our team will respond as soon as possible."
                )
                .setColor("#7C3AED")
                .setFooter({
                    text: "Family Ticket • Professional Support"
                });

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setCustomId("ticket_pc")
                    .setLabel("PC Optimization")
                    .setEmoji("🖥️")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("ticket_msi")
                    .setLabel("MSI App Player")
                    .setEmoji("🎮")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("ticket_problem")
                    .setLabel("PC Problems")
                    .setEmoji("🔧")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("ticket_general")
                    .setLabel("General Support")
                    .setEmoji("💬")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("ticket_purchase")
                    .setLabel("Purchase / Services")
                    .setEmoji("🛒")
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }

        return;
    }

    // ==============================
    // BUTTONS
    // ==============================

    if (!interaction.isButton()) return;

    const ticketTypes = {

        ticket_pc: {
            name: "PC Optimization",
            emoji: "🖥️",
            prefix: "pc-optimization",
            color: "#3498DB",
            description:
                "Please provide your PC specifications and explain what you want optimized."
        },

        ticket_msi: {
            name: "MSI App Player",
            emoji: "🎮",
            prefix: "msi-app-player",
            color: "#2ECC71",
            description:
                "Please provide your MSI App Player version, game, FPS and explain the issue."
        },

        ticket_problem: {
            name: "PC Problems",
            emoji: "🔧",
            prefix: "pc-problems",
            color: "#F1C40F",
            description:
                "Please describe your PC problem, error message, driver issue or Windows problem."
        },

        ticket_general: {
            name: "General Support",
            emoji: "💬",
            prefix: "general-support",
            color: "#9B59B6",
            description:
                "Please explain what you need help with."
        },

        ticket_purchase: {
            name: "Purchase / Services",
            emoji: "🛒",
            prefix: "purchase-services",
            color: "#E91E63",
            description:
                "Please tell us which service or product you are interested in."
        }
    };

    // ==============================
    // OPEN TICKET
    // ==============================

    if (ticketTypes[interaction.customId]) {

        // Prevent Discord timeout
        await interaction.deferReply({
            ephemeral: true
        });

        try {

            const type = ticketTypes[interaction.customId];

            // Check if user already has a ticket
            const existingTicket =
                interaction.guild.channels.cache.find(
                    channel =>
                        channel.topic ===
                        `ticket-owner:${interaction.user.id}`
                );

            if (existingTicket) {

                return interaction.editReply({
                    content:
                        `⚠️ You already have an open ticket: ${existingTicket}`
                });
            }

            // ==============================
            // PERMISSIONS
            // ==============================

            const permissionOverwrites = [

                {
                    id: interaction.guild.id,
                    deny: [
                        PermissionsBitField.Flags.ViewChannel
                    ]
                },

                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AttachFiles
                    ]
                }
            ];

            // Optional staff role
            if (process.env.STAFF_ROLE_ID) {

                permissionOverwrites.push({
                    id: process.env.STAFF_ROLE_ID,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AttachFiles
                    ]
                });
            }

            // ==============================
            // CHANNEL NAME
            // ==============================

            const username = interaction.user.username
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-")
                .slice(0, 40);

            const ticketChannel =
                await interaction.guild.channels.create({

                    name: `${type.prefix}-${username}`,

                    type: ChannelType.GuildText,

                    topic:
                        `ticket-owner:${interaction.user.id}`,

                    permissionOverwrites
                });

            // ==============================
            // CLOSE BUTTON
            // ==============================

            const closeButton =
                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Close Ticket")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger);

            const closeRow =
                new ActionRowBuilder()
                    .addComponents(closeButton);

            // ==============================
            // TICKET MESSAGE
            // ==============================

            const ticketEmbed =
                new EmbedBuilder()
                    .setTitle(
                        `${type.emoji} ${type.name}`
                    )

                    .setDescription(
                        `Welcome <@${interaction.user.id}>! 👋\n\n` +

                        `${type.description}\n\n` +

                        "**Please provide:**\n" +

                        "• Your issue or request\n" +
                        "• PC specifications if relevant\n" +
                        "• Screenshots/videos if helpful\n\n" +

                        "👥 **A staff member will assist you shortly.**\n" +
                        "🔒 This ticket is private."
                    )

                    .setColor(type.color)

                    .setFooter({
                        text:
                            "Family Ticket • Support Team"
                    })

                    .setTimestamp();

            await ticketChannel.send({

                content:
                    `<@${interaction.user.id}>` +

                    (
                        process.env.STAFF_ROLE_ID
                            ? ` <@&${process.env.STAFF_ROLE_ID}>`
                            : ""
                    ),

                embeds: [
                    ticketEmbed
                ],

                components: [
                    closeRow
                ]
            });

            // ==============================
            // SUCCESS
            // ==============================

            await interaction.editReply({

                content:
                    `✅ Your **${type.name}** ticket has been created: ${ticketChannel}`
            });

        } catch (error) {

            console.error(
                "Error creating ticket:",
                error
            );

            await interaction.editReply({

                content:
                    "❌ I couldn't create the ticket. Make sure the bot has **Manage Channels** permission."
            }).catch(() => {});
        }

        return;
    }

    // ==============================
    // CLOSE TICKET
    // ==============================

    if (interaction.customId === "close_ticket") {

        await interaction.deferReply({
            ephemeral: true
        });

        await interaction.editReply({

            content:
                "🔒 This ticket will be closed in **3 seconds**..."
        });

        setTimeout(() => {

            interaction.channel
                .delete()
                .catch(error => {

                    console.error(
                        "Error deleting ticket:",
                        error
                    );
                });

        }, 3000);

        return;
    }
});

// ==============================
// LOGIN
// ==============================

if (!process.env.TOKEN) {

    console.error(
        "❌ TOKEN environment variable is missing."
    );

    process.exit(1);
}

client.login(process.env.TOKEN).catch(error => {

    console.error(
        "❌ Discord login failed:",
        error
    );
});