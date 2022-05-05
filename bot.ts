import Discord from 'discord.js';
import process from 'process';
import { config as configDotenv } from 'dotenv'
const clashApi = require('clash-of-clans-api');

configDotenv({
    path: '.env'
})

const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log('Logged in!');
client.user?.setPresence({
    status: 'online',
    activity: {
        name: ';help',
        type: 'PLAYING'
    }
})
}).catch(err => {
    console.error("You fucked up: " + err);
});

let CocClient = clashApi({
    token: process.env.COC_TOKEN // Optional, can also use COC_API_TOKEN env variable
});

client.on("message", async message => {
    if (!message.author.bot) {
        if (message.content.startsWith(";war")) {
            switch (message.content.split(" ")[1]) {
                case "status":
                    //@ts-ignorea
                    CocClient.clanCurrentWarByTag("#2QQLQCYLQ").then(clan => {
                        console.log(clan.state.toLowerCase())
                        if(clan.state.toLowerCase() == "not_In_War") {
                            return message.channel.send("No war is currently in progress.");
                        }
                        if(clan.state.toLowerCase() == "preparation") {
                            return message.channel.send("War is currently in preparation.");
                        }
                        if(clan.state.toLowerCase() == "in_War") {
                            return message.channel.send(`War is currently in progress. ${clan.attacks} attacks with ${clan.stars} stars and ${clan.destructionPercentage}% destruction.`);
                        }
                        if(clan.state.toLowerCase() == "war_Ended") {
                            return message.channel.send("War has ended.");
                        }
                        if(clan.state.toLowerCase() == "in_matchaking") {
                            return message.channel.send("War is currently in matchaking.");
                        }
                    }).catch((err: any) => {
                        console.error("You fucked up: " + err);
                    })
            }
        }
        if(message.content.startsWith(";help")) {
            return message.channel.send("```;war status - Check the status of the current war.```");
        }
    }
})