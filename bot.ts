import Discord, { MessageEmbed } from 'discord.js';
import process from 'process';
import { config as configDotenv } from 'dotenv'
import { getEnabledCategories } from 'trace_events';
const clashApi = require('clash-of-clans-api');
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";

configDotenv({
    path: '.env'
})

const client = new Discord.Client();

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG!.toString());

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
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

function formatDate(clan:any, endTime:string) {
    const endTimeFull = clan[endTime];
    const endDate = endTimeFull.split("T")[0];
    const endingTime = endTimeFull.split("T")[1].split(".")[0];
    let endingDate: String[] = endDate.toString().match(/.{1,2}/g)
    let endinggDate = endingDate[2] + "/" + endingDate[3] + "/" + endingDate[0] + endingDate[1]
    let enddTime: String[] = endingTime.toString().match(/.{1,2}/g)
    const endTimee = endinggDate + " at " + enddTime.join(":")
    return endTimee
}
let CocClient:any;
try{
CocClient = clashApi({
    token: process.env.COC_TOKEN
    //
});
} catch(err:any){
CocClient = clashApi({
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjI0NzFmOTZlLWIyZTItNDIxNi04ZjFjLWIyZDU4NmRjOTI5OSIsImlhdCI6MTY1MTg1NDkyMywic3ViIjoiZGV2ZWxvcGVyLzc2MGFhNzYwLTEzNjMtMjFmNC04N2U3LTMyNTg2YTUxODczZiIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE2OS4xMzkuOC4yMTkiXSwidHlwZSI6ImNsaWVudCJ9XX0.TaE4yX8pfvrYOXKtZUqt0eZw-yRsmD10NofsJ6lHZGYnsEeIqCO5bDV-yJX2kfy76Oql1TXJjFMPWLtMVx3zsQ"
})
}

client.on("message", async message => {
    if (!message.author.bot) {
        if (message.content.startsWith(";war")) {
            switch (message.content.split(" ")[1]) {
                case "status":
                    //@ts-ignorea
                    CocClient.clanCurrentWarByTag("#2QQLQCYLQ").then(clan => {
                        if (clan.state.toLowerCase() == "notinwar") {
                            return message.reply("No war is currently in progress.");
                        }
                        if (clan.state.toLowerCase() == "preparation") {
                            return message.reply("War is currently in preparation.");
                        }
                        if (clan.state.toLowerCase() == "inwar") {
                            const embed = new MessageEmbed()
                            if (clan.opponent.stars > clan.clan.stars) {
                                embed.setColor('#ff0000')
                            } else {
                                embed.setColor('#7CFC00')
                            }

                            embed.setTitle(`In war with ${clan.opponent.name}!`)
                                .setAuthor("Big Cocs", clan.clan.badgeUrls.small)
                                .addField("War start time", formatDate(clan, "startTime"), false)
                                .addField("War end time", formatDate(clan, "endTime"), false)
                                .setImage(clan.opponent.badgeUrls.small)
                                .addField("Opponent stars", clan.opponent.stars, false)
                                .addField("Our Stars", clan.clan.stars, false)
                            return message.channel.send(embed);
                        }
                        if (clan.state.toLowerCase() == "warended") {
                            const endEmbed = new MessageEmbed()
                            if (clan.opponent.stars > clan.clan.stars) {
                                endEmbed.setColor('#ff0000')
                                endEmbed.setTitle(`${clan.opponent.name} won the war!`)
                            } else {
                                endEmbed.setColor('#7CFC00')
                                endEmbed.setTitle(`${clan.clan.name} won the war!`)
                            }

                                endEmbed.setAuthor("Big Cocs", clan.clan.badgeUrls.small)
                                .addField("War start time", formatDate(clan, "startTime"), false)
                                .addField("War end time", formatDate(clan, "endTime"), false)
                                .setImage(clan.opponent.badgeUrls.small)
                                .addField("Opponent stars", clan.opponent.stars, false)
                                .addField("Our Stars", clan.clan.stars, false)
                            return message.channel.send(endEmbed);
                        }
                        if (clan.state.toLowerCase() == "inmatchaking") {
                            return message.channel.send("War is currently in matchaking.");
                        }
                    }).catch((err: any) => {
                        console.error("You fucked up: " + err);
                    })
            }
        }
        if (message.content.startsWith(";stats")) {
            if (message.content.split(" ").length != 2) {
                return message.channel.send("Invalid syntax. Usage: ;stats <name>");
            } else {
                        CocClient.clanByTag("#2QQLQCYLQ").then((cllan: any) => {
                            let usr;
                            for(let i in cllan.memberList) {
                                if(cllan.memberList[i].name.toLowerCase() == message.content.substring(7, message.content.length).toLowerCase()) {
                                    usr = cllan.memberList[i]
                                    break
                                }
                            }
                            try{
                        CocClient.playerByTag(usr.tag).then((usr: any) => {
                            let usrEmbed = new MessageEmbed()
                            .setTitle(usr.name)
                            .setAuthor("Big Cocs", cllan.badgeUrls.small)
                            .addField("Town Hall", usr.townHallLevel, false)
                            .addField("Trophies", usr.trophies, false)
                            .addField("Attack Wins", usr.attackWins, false)
                            .addField("Defense Wins", usr.defenseWins, false)
                            .addField("Donations", usr.donations, false)
                            .addField("Donations Received", usr.donationsReceived, false)
                            .addField("League", usr.league.name, false)
                            .setImage(usr.league.iconUrls.small)
                            message.channel.send(usrEmbed)
                            //return message.channel.send(`${usr.name} is in clan ${usr.clan.name}. They are at Town Hall ${usr.townHallLevel} and have ${usr.trophies} trophies. They have ${usr.attackWins} attack wins and ${usr.defenseWins} defence wins. They are in ${usr.league.name}.`);
                        }).catch((err: any) => {
                            console.error("You fucked up: " + err);
                            message.reply(message.content.substring(7, message.content.length) + " is not a player in the clan.");
                        })
                    } catch(err) {
                        console.error("You fucked up: " + err);
                        message.reply(message.content.substring(7, message.content.length) + " is not a player in the clan.");
                    }
                    })
                }
            }
            if (message.content.startsWith(";help")) {
                return message.channel.send("```;war status - Check the status of the current war. \n;stats <name> - Check the stats of a player. \n;members - Lists names of all members in the clan.```");
            }
            if(message.content.startsWith(";members")){
                CocClient.clanByTag("#2QQLQCYLQ").then((cllan: any) => {
                    let members:String[] = [];
                    for(let i in cllan.memberList) {
                        members.push(cllan.memberList[i].name)
                    }
                    message.channel.send(members);
            })
        }
    }
})