const { EmbedBuilder } = require("@discordjs/builders");
const { default: axios } = require("axios");
const { Client, GatewayIntentBits } = require("discord.js");
const { FSDB } = require("file-system-db");

// create database
const db = new FSDB("./db.json", false);

const TOKEN =
  "MTE4NjcyNTcwODk3NDc5NjkxMQ.Gq-dDr.QzRRTPdzVqBe_JRBONUJCHX0iSUBTUVVyOa6Ko";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

function Tools() {
  // convert data to €2,33
  function converterDuits(number) {
    n = String(number);
    return `€${n[0]},${n[1]}${n[2]}`;
  }

  // convert data to €2,33
  function converterDutch(number) {
    n = String(number);
    return `€${n[0]},${n[2]}${n[3]}`;
  }

  // convert data to €2,33
  function icons(lower, hight) {
    if (lower >= hight) {
      console;
      return ":arrow_lower_left:";
    } else if (lower == hight) {
      return ":arrow_lower_left:";
    } else {
      return ":arrow_upper_right:";
    }
  }

  return {
    converterDuits: converterDuits,
    converterDutch: converterDutch,
    icons: icons,
  };
}

function BezineBot() {
  // get database values
  let databaseValueE5 = 900000;
  let databaseValueE10 = 900000;
  let databaseValueDIESEL = 900000;
  // get dutch values
  let dutchValueE5 = 900000;
  let dutchValueE10 = 900000;
  let dutchValueDIESEL = 900000;
  // german values
  let germanValueE5 = 900000;
  let germanValueE10 = 900000;
  let germanValueDIESEL = 900000;

  tools = new Tools();

  async function fetchDatabaseValues() {
    await db.get("data").forEach((element) => {
      let e5Data = element["e5"];
      let e10Data = element["e10"];
      let dieselData = element["diesel"];
      if (e5Data < databaseValueE5) databaseValueE5 = e5Data;
      if (e10Data < databaseValueE10) databaseValueE10 = e10Data;
      if (dieselData < databaseValueDIESEL) databaseValueDIESEL = dieselData;
    });
  }

  async function fetchDutchValues() {
    await axios({
      method: "get",
      url: "https://api.grid.com/fuelstation/FuelStations/location/3210?subscription-key=c01b0b54ccd64a5c8d41b84fa21aa060",
    }).then(async (data) => {
      data = data.data.data.prices;

      await data.forEach((element) => {
        if (element.type == "Gasoline") {
          dutchValueE10 = tools.converterDutch(element.price);
        }

        if (element.type == "PremiumGasoline") {
          dutchValueE5 = tools.converterDutch(element.price);
        }

        if (element.type == "Diesel") {
          dutchValueDIESEL = tools.converterDutch(element.price);
        }
      });
    });
  }

  async function fetchGermanValues() {
    await axios({
      method: "get",
      url: "https://api.tankstelle.aral.de//api/v3/stations/20179800/prices",
    }).then(async (data) => {
      data = data.data;
      germanValueE5 = data.data.prices.F00104;
      germanValueE10 = data.data.prices.F00113;
      germanValueDIESEL = data.data.prices.F00400;
    
      db.push("data", [
        {
          e5: germanValueE5,
          e10: germanValueE10,
          diesel: germanValueDIESEL,
        },
      ]);
    });
  }

  async function run() {
    try {
      await fetchDutchValues().then(async () => {
        fetchDatabaseValues();
        await fetchGermanValues().then(async () => {
          var channel = await client.channels.cache.get("1186725814050496755");
          // send message
          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("Aral Emmerich")
                .setURL(
                  "https://tankstelle.aral.de/emmerich/kattegatweg-1/20179700"
                )
                .setDescription(" ")
                .setThumbnail(
                  "https://dccdn.de/tankstelle.aral.de/vendor/octane/images/aral-logo.webp"
                )
                .addFields(
                  { name: "\u200B", value: "\u200B" },
                  {
                    name: "__EURO 95 (E10)__",
                    value:
                      "**" +
                      tools.converterDuits(germanValueE10) +
                      "  " +
                      tools.icons(databaseValueE10, germanValueE10) +
                      " [ :flag_nl: " +
                      dutchValueE10 +
                      " ]**",
                    inline: false,
                  },
                  {
                    name: "__EURO 98 (E5)__",
                    value:
                      "**" +
                      tools.converterDuits(germanValueE5) +
                      "  " +
                      tools.icons(databaseValueE5, germanValueE5) +
                      " [ :flag_nl: " +
                      dutchValueE5 +
                      " ]**",
                    inline: false,
                  },
                  {
                    name: "__DIESEL__",
                    value:
                      "**" +
                      tools.converterDuits(germanValueDIESEL) +
                      "  " +
                      tools.icons(databaseValueDIESEL, germanValueDIESEL) +
                      " [ :flag_nl: " +
                      dutchValueDIESEL +
                      " ]**",
                    inline: false,
                  }
                )

                .setTimestamp(),
            ],
          });
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
  return {
    run: run,
  };
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


BezineBot = BezineBot();


const r = async () => {
  await client.login(TOKEN).then(async () => {
    BezineBot.run();

    console.log("[" + new Date().toLocaleString() + "] Bot started");

  });
};


r();


try {
  setInterval(() => {
    BezineBot.run();
    console.log("[" + new Date().toLocaleString() + "] New data send");
  }, 1 * 60 * 60 * 1000);
} catch (e) {
  console.log(e);
}