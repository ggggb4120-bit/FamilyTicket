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
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "setup-ticket") {
            const button = new ButtonBuilder()
                .setCustomId("open_ticket")
                .setLabel("Open Ticket")
                .setEmoji("🎫")
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            const embed = new EmbedBuilder()
                .setTitle("🎫 Support Tickets")
                .setDescription("Click the button below to open a private support ticket.")
                .setColor("Blue");

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === "open_ticket") {
            const existingTicket = interaction.guild.channels.cache.find(
                channel => channel.name === `ticket-${interaction.user.id}`
            );

            if (existingTicket) {
                return interaction.reply({
                    content: `You already have a ticket: ${existingTicket}`,
                    ephemeral: true
                });
            }

            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.id}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
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

            const closeButton = new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("Close Ticket")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(closeButton);

            await ticketChannel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🎫 Ticket Opened")
                        .setDescription("Please explain your problem. A staff member will help you soon.")
                        .setColor("Green")
                ],
                components: [row]
            });

            await interaction.reply({
                content: `Your ticket has been created: ${ticketChannel}`,
                ephemeral: true
            });
        }

        if (interaction.customId === "close_ticket") {
            await interaction.reply("🔒 Closing ticket...");

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 3000);
        }
    }
});

client.login(process.env.TOKEN);
