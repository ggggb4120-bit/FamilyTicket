const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
    new SlashCommandBuilder()
        .setName("setup-ticket")
        .setDescription("Create the ticket panel")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registering /setup-ticket...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log("✅ /setup-ticket registered!");
    } catch (error) {
        console.error(error);
    }
})();
