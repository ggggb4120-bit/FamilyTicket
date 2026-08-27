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

client.once("ready", () => {
    console.log(`Bot online as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {

    // ==============================
    // /setup-ticket COMMAND
    // ==============================
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "setup-ticket") {

            const button = new ButtonBuilder()
                .setCustomId("open_ticket")
                .setLabel("Open Ticket")
                .setEmoji("🎫")
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder()
                .addComponents(button);

            const embed = new EmbedBuilder()
                .setTitle("🎫 Support Tickets")
                .setDescription(
                    "Click the button below to open a private support ticket."
                )
                .setColor("Blue");

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }

    // ==============================
    // BUTTONS
    // ==============================
    if (interaction.isButton()) {

        // ==============================
        // OPEN TICKET
        // ==============================
        if (interaction.customId === "open_ticket") {

            // IMPORTANT:
            // Acknowledge Discord immediately so it doesn't time out.
            await interaction.deferReply({
                ephemeral: true
            });

            try {

                const existingTicket =
                    interaction.guild.channels.cache.find(
                        channel =>
                            channel.name === `ticket-${interaction.user.id}`
                    );

                if (existingTicket) {
                    return interaction.editReply({
                        content: `You already have a ticket: ${existingTicket}`
                    });
                }

                const ticketChannel =
                    await interaction.guild.channels.create({
                        name: `ticket-${interaction.user.id}`,
                        type: ChannelType.GuildText,

                        permissionOverwrites: [
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
                                    PermissionsBitField.Flags.ReadMessageHistory
                                ]
                            }
                        ]
                    });

                // ==============================
                // CLOSE BUTTON
                // ==============================

                const closeButton = new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Close Ticket")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder()
                    .addComponents(closeButton);

                // ==============================
                // TICKET MESSAGE
                // ==============================

                await ticketChannel.send({
                    content: `<@${interaction.user.id}>`,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("🎫 Ticket Opened")
                            .setDescription(
                                "Please explain your problem. A staff member will help you soon."
                            )
                            .setColor("Green")
                    ],
                    components: [row]
                });

                // ==============================
                // SUCCESS MESSAGE
                // ==============================

                await interaction.editReply({
                    content: `Your ticket has been created: ${ticketChannel}`
                });

            } catch (error) {

                console.error("Error creating ticket:", error);

                await interaction.editReply({
                    content:
                        "❌ Something went wrong while creating your ticket. Please try again."
                });
            }
        }

        // ==============================
        // CLOSE TICKET
        // ==============================
        if (interaction.customId === "close_ticket") {

            await interaction.reply("🔒 Closing ticket...");

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 3000);
        }
    }
});

// ==============================
// LOGIN
// ==============================

client.login(process.env.TOKEN);