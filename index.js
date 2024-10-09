const Discord = require('discord.js');
const client = new Discord.Client();
const sqlite = require('sqlite3').verbose()
const token = process.env.DISCORD_TOKEN; // Discord bot token
const apiKey = process.env.HYPIXEL_API_KEY; // Get Hypixel API key from .env
const apiUrl = `https://api.hypixel.net/player?key=${apiKey}&name=`
const fetch = require('node-fetch')
const keep_alive = require('./keep_alive.js')
const skin = 'https://visage.surgeplay.com/full/'
const Canvas = require('canvas')
const { registerFont } = require('canvas');
const { Image } = require('canvas')

async function getDatan(name) {
  const response = await fetch(apiUrl+name)
  const data = await response.json()
  return data
} 
function command(str, msg) {
  words=msg.content.split(" ")
  words[0]=words[0].toLowerCase()
  if(words[0]==str){
    return msg.content.toLowerCase().startsWith(str)
  }
  //return msg.content.toLowerCase().startsWith(str);
}
client.on('ready', () =>{
  console.log('bot is now online')
  client.user.setActivity('*help', { type: 'LISTENING' });
  let db = new sqlite.Database('./hypixel.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
  db.run(`CREATE TABLE IF NOT EXISTS data(userid INTEGER NOT NULL,username TEXT NOT NULL,games INTEGER NOT NULL,level INTEGER NOT NULL,wins INTEGER NOT NULL,finalsk INTEGER NOT NULL,finalsd INTEGER NOT NULL,beds INTEGER NOT NULL,kd INTEGER NOT NULL, winstreak INTEGER NOT NULL,bedslost INTEGER NOT NULL,indexbw INTEGER NOT NULL,timestart INTEGER NOT NULL)`)
  let ndb = new sqlite.Database('./hypixel.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
  ndb.run(`CREATE TABLE IF NOT EXISTS names(discid INTEGER NOT NULL,username TEXT NOT NULL,disctag TEXT NOT NULL)`)
})

client.on('message', async(message) =>{
  let msg = message.content.toLowerCase()
  if(message.author.bot) return;
  let db = new sqlite.Database('./hypixel.db', sqlite.OPEN_READWRITE)
  /////////////////////////////////////////////////////////////////////////////////////////////////
  if(command('*sesstats', message)){
    discordid=message.member.id
    let query2 = `SELECT * FROM names WHERE discid = ?`
    db.get(query2, [discordid], (err, row) => {
      if(err){
        console.log(err)
        return
      }
      let args = message.content.split(" ")
      name1 = args[1]
      arr = []
      if(name1===undefined&&message.member!=null){
        if(row===undefined){
          message.channel.send("Unlinked player. Use *link [ign] and make sure your discord is linked to hypixel")
          return
        }
        else{name1=row.username}
      }
      const canvas = Canvas.createCanvas(800, 500)
      registerFont('./font.ttf', { family: 'font' })
      const ctx = canvas.getContext('2d')
      async function bckgrnd(){
        const background = await Canvas.loadImage('wallpaper.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      }
      bckgrnd()
      ctx.font = '32px font';
      ctx.textAlign = "start";
      ctx.fillStyle = "white";
      getDatan(name1).then(data =>{
        games=data.player.stats.Bedwars.games_played_bedwars
        level=data.player.achievements.bedwars_level
        wins=data.player.stats.Bedwars.wins_bedwars
        finalsk = data.player.stats.Bedwars.final_kills_bedwars
        finalsd=data.player.stats.Bedwars.final_deaths_bedwars
        beds = data.player.stats.Bedwars.beds_broken_bedwars
        kd=(finalsk/finalsd).toFixed(2)
        winstreak=data.player.stats.Bedwars.winstreak
        uuid=(data.player.uuid)
        bedlost=data.player.stats.Bedwars.beds_lost_bedwars
        index = ((kd*kd)*level).toFixed(0)
        displayname=data.player.displayname
        var d = new Date()
        epoc = d.getTime()
        let query = `SELECT * FROM data WHERE userid = ?`
        db.get(query, [uuid], (err, row) => {
          if(err){
            console.log(err)
            return
          }
          if(row===undefined){
            let query9 = `SELECT * FROM data`
            db.all(query9, (err, row) => {
              if(err){
                console.log(err)
                return
              }
              if(row===undefined){
                // console.log(uuid)
                // message.channel.send("Player not linked. Use *link [ign] to link your account")
              }
              else{
                console.log(row)
              }
            })
            message.channel.send("Player not linked. Use *link [ign] to link your account")
          }
          else{
            sesgames=games-row.games
            seslevels=level-row.level
            seswins=wins-row.wins
            sesfinalsk=finalsk-row.finalsk
            sesfinalsd=finalsd-row.finalsd
            timetrack=((epoc-row.timestart)/86400000).toFixed(2)
            sesbeds=beds-row.beds
            losses = sesgames-seswins
            if(data.player.newPackageRank===undefined){
              rank='non'
            }
            if(data.player.newPackageRank==='VIP'){
              rank='VIP'
            }
            if(data.player.newPackageRank==='VIP_PLUS'){
              rank='VIP+'
            }
            if(data.player.newPackageRank==='MVP'){
              rank='MVP'
            }
            if(data.player.newPackageRank==='MVP_PLUS'){
              rank='MVP+'
            }
            if(data.player.monthlyPackageRank==='SUPERSTAR'){
              rank = 'MVP++'
            }
            if(losses===0){
              seswlr = seswins.toFixed(2)
            }
            else{
              seswlr=(seswins/losses).toFixed(2)
            }
            if(sesfinalsd===0){
              seskd=sesfinalsk.toFixed(2)
            }
            else{
              seskd=(sesfinalsk/sesfinalsd).toFixed(2)
            }
            sesbedlost=bedlost-row.bedslost
            if(sesbedlost===0){
              sesbblr=sesbeds
            }
            else{
              sesbblr=(sesbeds/sesbedlost).toFixed(2)
            }
            ctx.fillText('Levels gained: ' + seslevels, 25, 195)
            ctx.fillText('Final Kills: ' + sesfinalsk, 25, 245)
            ctx.fillText('Final Deaths: ' + sesfinalsd, 25, 295)
            ctx.fillText('Final KD: ' + seskd, 25, 345)
            ctx.fillText('Days Tracked: ' + timetrack, 25, 395)
            ctx.fillText('Games: ' + sesgames, 600, 195)
            ctx.fillText('Wins: ' + seswins, 600, 245)
            ctx.fillText('WLR: ' + seswlr, 600, 295)
            ctx.fillText('Beds: ' + sesbeds, 600, 345)
            ctx.fillText('BBLR: ' + sesbblr, 600, 395)
            //sesindex=(level*(seskd*seskd)).toFixed(0)
            //color = ((1 << 24) * Math.random() | 0).toString(16);
            // const embed = new Discord.MessageEmbed()
            //   .setColor(`#${color}`)
            //   .setTitle(displayname + "'s Session Stats")
            //   .addField('Levels Gained: ',seslevels,true)
            //   .addField('Wins: ',seswins,true)
            //   .addField('Games: ',sesgames,true)
            //   .addField('Final Kills: ',sesfinalsk,true)
            //   .addField('Final Deaths: ',sesfinalsd,true)
            //   .addField('Final KD: ',seskd,true)
            //   .addField('Beds: ',sesbeds,true)
            //   .addField('BBLR: ',sesbblr,true)
            //   .addField('Time Tracked: ',timetrack + " Days",true)
            // message.channel.send(embed)
            ctx.textAlign = "center";
            ctx.fillStyle = "#721a8a" 
            ctx.fillText("Session Stats",400,67)
            if(rank=='non'){
              ctx.fillStyle = "#5e5e5e"
              ctx.fillText(displayname,400,32)
            }
            if(rank=='VIP'||rank=='VIP+'){
              ctx.fillStyle = "#34eb40"
              ctx.fillText(`[`+rank+'] '+displayname,400,32)
            }
            if(rank=='MVP'||rank=='MVP+'){
              ctx.fillStyle = "#1eaee3"
              ctx.fillText(`[`+rank+'] '+displayname,400,32)       
            }
            if(rank=='MVP++'){
              ctx.fillStyle = "orange"
              ctx.fillText(`[`+rank+'] '+displayname,400,32)
            }
            function sleep(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            }
            async function player(){
              const player = await Canvas.loadImage(skin+uuid);
              ctx.drawImage(player, 295, 95,250,400);
              //console.log(player)
            }
            player()
            function sleep(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            }
            sleep(1000)
              .then(() => {
                //console.log("woo")
                const attachment = new Discord.MessageAttachment(canvas.toBuffer())
                message.channel.send(attachment)
              })
          }
        })
      }).catch(function () {
        message.channel.send("Username Incorrect");
      });
    })
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////
  if(command('*link', message)){
    let args = message.content.split(" ")
    name1 = args[1]
    arr = []
    getDatan(name1).then(data =>{
      games=data.player.stats.Bedwars.games_played_bedwars
      level=data.player.achievements.bedwars_level
      wins=data.player.stats.Bedwars.wins_bedwars
      finalsk = data.player.stats.Bedwars.final_kills_bedwars
      finalsd=data.player.stats.Bedwars.final_deaths_bedwars
      beds = data.player.stats.Bedwars.beds_broken_bedwars
      kd=(finalsk/finalsd).toFixed(2)
      winstreak=data.player.stats.Bedwars.winstreak
      uuid=(data.player.uuid)
      bedlost=data.player.stats.Bedwars.beds_lost_bedwars
      index = ((kd*kd)*level).toFixed(0)
      displayname=data.player.displayname
      discord=data.player.socialMedia.links.DISCORD
      tag=message.member.user.tag
      discordid=message.member.id
      var d = new Date()
      epoc = d.getTime()
      if(discord===tag){
        let query = `SELECT * FROM names WHERE discid = ?`
        db.get(query, [discordid], (err, row) => {
          if(err){
            console.log(err)
            return
          }
          if(row===undefined){
            message.channel.send('success')
            let insertdata = db.prepare(`INSERT INTO names VALUES(?,?,?)`)
            insertdata.run(discordid,displayname,tag)
            insertdata.finalize()
            db.close
            return;
          }
          else{console.log(row)}
        })
        let query2 = `SELECT * FROM data WHERE userid = ?`
        db.get(query2, [uuid], (err, row) => {
          if(err){
            console.log(err)
            return
          }
          if(row===undefined){
            let insertdata = db.prepare(`INSERT INTO data VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
            insertdata.run(uuid,displayname,games,level,wins,finalsk,finalsd,beds,kd,winstreak,bedlost,index,epoc)
            insertdata.finalize()
            db.close
            return;
          }
        })
      }
      else{
        message.channel.send('Error linking name')
      }
    }).catch(function () {
      message.channel.send("Error linking name");
    });
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////
  if(command('*updatename', message)){
    let args = message.content.split(" ")
    name1 = args[1]
    arr = []
    getDatan(name1).then(data =>{
      displayname=data.player.displayname
      discord=data.player.socialMedia.links.DISCORD
      tag=message.member.user.tag
      discordid=message.member.id
      if(discord===tag){
        db.run(`UPDATE names SET username = ?, disctag = ? WHERE discid = ?`,[displayname,tag,discordid])
      }
    }).catch(function () {
      message.channel.send("Error linking name");
    });
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////
  if(msg === '*resetstats'){
    discordid=message.member.id
    let query2 = `SELECT * FROM names WHERE discid = ?`
    db.get(query2, [discordid], (err, row) => {
      if(err){
        console.log(err)
        return
      }
      if(row===undefined){
        return
      }
      else{
        name1=row.username
        getDatan(name1).then(data =>{
          games=data.player.stats.Bedwars.games_played_bedwars
          level=data.player.achievements.bedwars_level
          wins=data.player.stats.Bedwars.wins_bedwars
          finalsk = data.player.stats.Bedwars.final_kills_bedwars
          finalsd=data.player.stats.Bedwars.final_deaths_bedwars
          beds = data.player.stats.Bedwars.beds_broken_bedwars
          kd=(finalsk/finalsd).toFixed(2)
          winstreak=data.player.stats.Bedwars.winstreak
          uuid=(data.player.uuid)
          bedlost=data.player.stats.Bedwars.beds_lost_bedwars
          index = ((kd*kd)*level).toFixed(0)
          displayname=data.player.displayname
          var d = new Date()
          epoc = d.getTime()
          db.run(`UPDATE data SET username = ?, games = ?, level = ?, wins = ?, finalsk = ?, finalsd = ?, beds = ?, kd = ?, winstreak = ?, bedslost = ?, indexbw = ?,timestart = ? WHERE userid = ?`,[displayname,games,level,wins,finalsk,finalsd,beds,kd,winstreak,bedlost,index,epoc,uuid])
        }).catch(function () {
          message.channel.send("Error linking name");
        });
      }
    })
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////
  if(msg === '*help'){
    message.channel.send("`*link [ign]` - Links name and adds to database\n`*sesstats [ign]` - says your session stats\n`*updatename [ign]` - Will change the account ign you are linked to/discord tag\n`*resetstats` - will reset starting stats for session (Only works if discord linked)\n`*bw [ign]` - will show a canvas of bedwars stats\n`*bw[1/2/3/4] [ign]` - Canvas of bedwars stats in gamemode\n`*invite` - Gives a link to invite bot to your server\nIf checking your own stats you do not need to put an ign if you are linked")
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////
  if(command('*bw', message)){
    discordid=message.member.id
    let query2 = `SELECT * FROM names WHERE discid = ?`
    db.get(query2, [discordid], (err, row) => {
      if(err){
        console.log(err)
        return
      }
      let args = message.content.split(" ")
      name1 = args[1]
      arr = []
      if(name1===undefined&&message.member!=null){
        if(row===undefined){
          message.channel.send("Unlinked player. Use *link [ign] and make sure your discord is linked to hypixel")
          return
        }
        else{name1=row.username}
      }
      const canvas = Canvas.createCanvas(800, 500)
      registerFont('./font.ttf', { family: 'font' })
      const ctx = canvas.getContext('2d')
      async function bckgrnd(){
        const background = await Canvas.loadImage('wallpaper.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      }
      bckgrnd()
      // const player = await Canvas.loadImage(skin + uuid)
      //ctx.drawImage(player, 265, 75,250,400)
      ctx.font = '32px font';
      ctx.textAlign = "start";
      ctx.fillStyle = "white";
      getDatan(name1).then(data =>{
        games=data.player.stats.Bedwars.games_played_bedwars
        level=data.player.achievements.bedwars_level
        wins=data.player.stats.Bedwars.wins_bedwars
        finalsk = data.player.stats.Bedwars.final_kills_bedwars
        finalsd=data.player.stats.Bedwars.final_deaths_bedwars
        beds = data.player.stats.Bedwars.beds_broken_bedwars
        kd=(finalsk/finalsd).toFixed(2)
        if(finalsd==undefined){
          finalsd=0
          kd=finalsk.toFixed(2)
        }
        winstreak=data.player.stats.Bedwars.winstreak
        uuid=(skin) + (data.player.uuid)
        bblr = (beds/(data.player.stats.Bedwars.beds_lost_bedwars)).toFixed(2)
        if(data.player.stats.Bedwars.beds_lost_bedwars==undefined){
          bblr=beds.toFixed(2)
        }
        eofk=data.player.stats.Bedwars.eight_one_final_kills_bedwars
        eofkd=(eofk/(data.player.stats.Bedwars.eight_one_final_deaths_bedwars)).toFixed(2)
        if(eofk==undefined){
          eofk=0
        }
        if(data.player.stats.Bedwars.eight_one_final_deaths_bedwars==undefined){
          eofkd=eofk.toFixed(2)
        }
        etfk=data.player.stats.Bedwars.eight_two_final_kills_bedwars
        etfkd=(etfk/(data.player.stats.Bedwars.eight_two_final_deaths_bedwars)).toFixed(2)
        if(etfk==undefined){
          etfk=0
        }
        if(data.player.stats.Bedwars.eight_two_final_deaths_bedwars==undefined){
          etfkd=etfk.toFixed(2)
        }
        ftfk=data.player.stats.Bedwars.four_three_final_kills_bedwars
        ftfkd=(ftfk/(data.player.stats.Bedwars.four_three_final_deaths_bedwars)).toFixed(2)
        if(ftfk==undefined){
          ftfk=0
        }
        if(data.player.stats.Bedwars.four_three_final_deaths_bedwars==undefined){
          ftfkd=ftfk.toFixed(2)
        }
        fffk=data.player.stats.Bedwars.four_four_final_kills_bedwars
        fffkd=(fffk/(data.player.stats.Bedwars.four_four_final_deaths_bedwars)).toFixed(2)
        if(fffk==undefined){
          fffk=0
        }
        if(data.player.stats.Bedwars.four_four_final_deaths_bedwars==undefined){
          fffkd=fffk.toFixed(2)
        }
        index = ((kd*kd)*level).toFixed(0)
        displayname=data.player.displayname
        if(data.player.newPackageRank===undefined){
          rank='non'
        }
        if(data.player.newPackageRank==='VIP'){
          rank='VIP'
        }
        if(data.player.newPackageRank==='VIP_PLUS'){
          rank='VIP+'
        }
        if(data.player.newPackageRank==='MVP'){
          rank='MVP'
        }
        if(data.player.newPackageRank==='MVP_PLUS'){
          rank='MVP+'
        }
        if(data.player.monthlyPackageRank==='SUPERSTAR'){
          rank = 'MVP++'
        }
        ctx.fillText('Games: ' + games, 25, 75)
        ctx.fillText('Level: ' + level, 25, 125) 
        ctx.fillText('Wins: ' + wins, 25, 175) 
        ctx.fillText('Final Kills: ' + finalsk, 25, 225) 
        ctx.fillText('Final KD: ' + kd, 25, 275)
        ctx.fillText('Beds: ' + beds, 25, 325) 
        ctx.fillText('Final Deaths: ' + finalsd, 25, 375)  
        ctx.fillText('Winstreak: ' + winstreak, 25, 425)
        ctx.fillText('BBLR: ' + bblr, 25, 475)
        ctx.fillText('1s Finals: ' + eofk, 510, 75)
        ctx.fillText('1s FKD: ' + eofkd, 510, 125) 
        ctx.fillText('2s Finals: ' + etfk, 510, 175) 
        ctx.fillText('2s FKD: ' + etfkd, 510, 225) 
        ctx.fillText('3s Finals: ' + ftfk, 510, 275)
        ctx.fillText('3s FKD: ' + ftfkd, 510, 325) 
        ctx.fillText('4s Finals: ' + fffk, 510, 375)  
        ctx.fillText('4s FKD: ' + fffkd, 510, 425)
        ctxcol="#696969"
        if(index>500){ctxcol="#ffffff"}
        if(index>1000){ctxcol="#fbff00"}
        if(index>3000){ctxcol="#ff9100"}
        if(index>7500){ctxcol="#4f0000"}
        if(index>15000){ctxcol="#36004f"}
        if(index>30000){ctxcol="#000e8f"}
        if(index>100000){ctxcol="#00ffff"}
        if(index>500000){ctxcol="#023800"}
        ctx.fillStyle = ctxcol
        ctx.fillText('Index: ' + index, 510, 475)
        ctx.textAlign = "center";
        if(rank=='non'){
          ctx.fillStyle = "#5e5e5e"
          ctx.fillText(displayname,400,32)
        }
        if(rank=='VIP'||rank=='VIP+'){
          ctx.fillStyle = "#34eb40"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        if(rank=='MVP'||rank=='MVP+'){
          ctx.fillStyle = "#1eaee3"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)       
        }
        if(rank=='MVP++'){
          ctx.fillStyle = "orange"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function player(){
          const player = await Canvas.loadImage(uuid);
          ctx.drawImage(player, 265, 75,250,400);
          //console.log(player)
        }
        player()
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        sleep(1000)
          .then(() => {
            //console.log("woo")
            const attachment = new Discord.MessageAttachment(canvas.toBuffer())
            message.channel.send(attachment)
          })
      }).catch(function () {
        message.channel.send("Name incorrect/Nicked");
      });
    })
  }
  ///////////////////////////////////////////////////
  ////////////////////////////////////
  if(command('*bw1', message)){
    discordid=message.member.id
    let query2 = `SELECT * FROM names WHERE discid = ?`
    db.get(query2, [discordid], (err, row) => {
      if(err){
        console.log(err)
        return
      }
      let args = message.content.split(" ")
      name1 = args[1]
      arr = []
      if(name1===undefined&&message.member!=null){
        if(row===undefined){
          message.channel.send("Unlinked player. Use *link [ign] and make sure your discord is linked to hypixel")
          return
        }
        else{name1=row.username}
      }
      const canvas = Canvas.createCanvas(800, 500)
      registerFont('./font.ttf', { family: 'font' })
      const ctx = canvas.getContext('2d')
      async function bckgrnd(){
        const background = await Canvas.loadImage('wallpaper.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      }
      bckgrnd()
      // const player = await Canvas.loadImage(skin + uuid)
      //ctx.drawImage(player, 265, 75,250,400)
      ctx.font = '32px font';
      ctx.textAlign = "start";
      ctx.fillStyle = "white";
      getDatan(name1).then(data =>{
        games=data.player.stats.Bedwars.eight_one_games_played_bedwars
        if(games==undefined){
          games=0
        }
        level=data.player.achievements.bedwars_level
        wins=data.player.stats.Bedwars.eight_one_wins_bedwars
        finalsk = data.player.stats.Bedwars.eight_one_final_kills_bedwars
        finalsd=data.player.stats.Bedwars.eight_one_final_deaths_bedwars
        beds = data.player.stats.Bedwars.eight_one_beds_broken_bedwars
        if(finalsk==undefined){
          finalsk=0
        }
        kd=(finalsk/finalsd).toFixed(2)
        if(finalsd==undefined){
          finalsd=0
          kd=finalsk.toFixed(2)
        }
        winstreak=data.player.stats.Bedwars.eight_one_winstreak
        if(wins==undefined){
          wins=0
          winstreak=0
        }
        uuid=(skin) + (data.player.uuid)
        bedlosts=data.player.stats.Bedwars.eight_one_beds_lost_bedwars
        losses=data.player.stats.Bedwars.eight_one_losses_bedwars
        wlr=(wins/losses).toFixed(2)
        if(losses==undefined){
          wlr=wins.toFixed(2)
          losses=0
        }
        regkills=data.player.stats.Bedwars.eight_one_kills_bedwars
        regdeaths=data.player.stats.Bedwars.eight_one_deaths_bedwars
        if(regkills==undefined){
          regkills=0
        }
        regkdr=(regkills/regdeaths).toFixed(2)
        if(regdeaths==undefined){
          regkdr=regkills.toFixed(2)
          regdeaths=0
        }
        if(beds==undefined){
          beds=0
        }
        bblr = (beds/bedlosts).toFixed(2)
        if(bedlosts==undefined){
          bblr=beds.toFixed(2)
          bedlosts=0
        }
        displayname=data.player.displayname
        if(data.player.newPackageRank===undefined){
          rank='non'
        }
        if(data.player.newPackageRank==='VIP'){
          rank='VIP'
        }
        if(data.player.newPackageRank==='VIP_PLUS'){
          rank='VIP+'
        }
        if(data.player.newPackageRank==='MVP'){
          rank='MVP'
        }
        if(data.player.newPackageRank==='MVP_PLUS'){
          rank='MVP+'
        }
        if(data.player.monthlyPackageRank==='SUPERSTAR'){
          rank = 'MVP++'
        }
        ctx.fillText('Games: ' + games, 25, 125)
        ctx.fillText('Winstreak: ' + winstreak, 510, 125)
        ctx.fillText('Wins: ' + wins, 25, 175)
        ctx.fillText('Losses: ' + losses, 25, 225)
        ctx.fillText('WLR: ' + wlr, 25, 275)
        ctx.fillText('Final Kills: ' + finalsk, 25, 325) 
        ctx.fillText('Final KD: ' + kd, 25, 425)
        ctx.fillText('Beds: ' + beds, 510, 175)
        ctx.fillText('Beds Lost: ' + bedlosts, 510, 225)
        ctx.fillText('Final Deaths: ' + finalsd, 25, 375)  
        ctx.fillText('BBLR: ' + bblr, 510, 275)
        ctx.fillText('Kills: ' + regkills, 510, 325)
        ctx.fillText('Deaths: ' + regdeaths, 510, 375)
        ctx.fillText('KD: ' + regkdr, 510, 425)
        ctxcol="#696969"
        ctx.textAlign = "center";
        ctx.fillText('Level: ' + level, 400, 67) 
        if(rank=='non'){
          ctx.fillStyle = "#5e5e5e"
          ctx.fillText(displayname,400,32)
        }
        if(rank=='VIP'||rank=='VIP+'){
          ctx.fillStyle = "#34eb40"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        if(rank=='MVP'||rank=='MVP+'){
          ctx.fillStyle = "#1eaee3"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)       
        }
        if(rank=='MVP++'){
          ctx.fillStyle = "orange"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function player(){
          const player = await Canvas.loadImage(uuid);
          await ctx.drawImage(player, 265, 75,250,400);
          //console.log(player)
        }
        player()
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        sleep(1000)
          .then(() => {
            //console.log("woo")
            const attachment = new Discord.MessageAttachment(canvas.toBuffer())
            message.channel.send(attachment)
          })
      }).catch(function () {
        message.channel.send("Name incorrect/Nicked");
      });
    })
  }
  if(command('*bw2', message)){
    discordid=message.member.id
    let query2 = `SELECT * FROM names WHERE discid = ?`
    db.get(query2, [discordid], (err, row) => {
      if(err){
        console.log(err)
        return
      }
      let args = message.content.split(" ")
      name1 = args[1]
      arr = []
      if(name1===undefined&&message.member!=null){
        if(row===undefined){
          message.channel.send("Unlinked player. Use *link [ign] and make sure your discord is linked to hypixel")
          return
        }
        else{name1=row.username}
      }
      const canvas = Canvas.createCanvas(800, 500)
      registerFont('./font.ttf', { family: 'font' })
      const ctx = canvas.getContext('2d')
      async function bckgrnd(){
        const background = await Canvas.loadImage('wallpaper.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      }
      bckgrnd()
      // const player = await Canvas.loadImage(skin + uuid)
      //ctx.drawImage(player, 265, 75,250,400)
      ctx.font = '32px font';
      ctx.textAlign = "start";
      ctx.fillStyle = "white";
      getDatan(name1).then(data =>{
        games=data.player.stats.Bedwars.eight_two_games_played_bedwars
        if(games==undefined){
          games=0
        }
        level=data.player.achievements.bedwars_level
        wins=data.player.stats.Bedwars.eight_two_wins_bedwars
        finalsk = data.player.stats.Bedwars.eight_two_final_kills_bedwars
        finalsd=data.player.stats.Bedwars.eight_two_final_deaths_bedwars
        beds = data.player.stats.Bedwars.eight_two_beds_broken_bedwars
        if(finalsk==undefined){
          finalsk=0
        }
        kd=(finalsk/finalsd).toFixed(2)
        if(finalsd==undefined){
          finalsd=0
          kd=finalsk.toFixed(2)
        }
        winstreak=data.player.stats.Bedwars.eight_two_winstreak
        if(wins==undefined){
          wins=0
          winstreak=0
        }
        uuid=(skin) + (data.player.uuid)
        bedlosts=data.player.stats.Bedwars.eight_two_beds_lost_bedwars
        losses=data.player.stats.Bedwars.eight_two_losses_bedwars
        wlr=(wins/losses).toFixed(2)
        if(losses==undefined){
          wlr=wins.toFixed(2)
          losses=0
        }
        regkills=data.player.stats.Bedwars.eight_two_kills_bedwars
        regdeaths=data.player.stats.Bedwars.eight_two_deaths_bedwars
        if(regkills==undefined){
          regkills=0
        }
        regkdr=(regkills/regdeaths).toFixed(2)
        if(regdeaths==undefined){
          regkdr=regkills.toFixed(2)
          regdeaths=0
        }
        if(beds==undefined){
          beds=0
        }
        bblr = (beds/bedlosts).toFixed(2)
        if(bedlosts==undefined){
          bblr=beds.toFixed(2)
          bedlosts=0
        }
        displayname=data.player.displayname
        if(data.player.newPackageRank===undefined){
          rank='non'
        }
        if(data.player.newPackageRank==='VIP'){
          rank='VIP'
        }
        if(data.player.newPackageRank==='VIP_PLUS'){
          rank='VIP+'
        }
        if(data.player.newPackageRank==='MVP'){
          rank='MVP'
        }
        if(data.player.newPackageRank==='MVP_PLUS'){
          rank='MVP+'
        }
        if(data.player.monthlyPackageRank==='SUPERSTAR'){
          rank = 'MVP++'
        }
        ctx.fillText('Games: ' + games, 25, 125)
        ctx.fillText('Winstreak: ' + winstreak, 510, 125)
        ctx.fillText('Wins: ' + wins, 25, 175)
        ctx.fillText('Losses: ' + losses, 25, 225)
        ctx.fillText('WLR: ' + wlr, 25, 275)
        ctx.fillText('Final Kills: ' + finalsk, 25, 325) 
        ctx.fillText('Final KD: ' + kd, 25, 425)
        ctx.fillText('Beds: ' + beds, 510, 175)
        ctx.fillText('Beds Lost: ' + bedlosts, 510, 225)
        ctx.fillText('Final Deaths: ' + finalsd, 25, 375)  
        ctx.fillText('BBLR: ' + bblr, 510, 275)
        ctx.fillText('Kills: ' + regkills, 510, 325)
        ctx.fillText('Deaths: ' + regdeaths, 510, 375)
        ctx.fillText('KD: ' + regkdr, 510, 425)
        ctxcol="#696969"
        ctx.textAlign = "center";
        ctx.fillText('Level: ' + level, 400, 67) 
        if(rank=='non'){
          ctx.fillStyle = "#5e5e5e"
          ctx.fillText(displayname,400,32)
        }
        if(rank=='VIP'||rank=='VIP+'){
          ctx.fillStyle = "#34eb40"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        if(rank=='MVP'||rank=='MVP+'){
          ctx.fillStyle = "#1eaee3"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)       
        }
        if(rank=='MVP++'){
          ctx.fillStyle = "orange"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function player(){
          const player = await Canvas.loadImage(uuid);
          await ctx.drawImage(player, 265, 75,250,400);
          //console.log(player)
        }
        player()
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        sleep(1000)
          .then(() => {
            //console.log("woo")
            const attachment = new Discord.MessageAttachment(canvas.toBuffer())
            message.channel.send(attachment)
          })
      }).catch(function () {
        message.channel.send("Name incorrect/Nicked");
      });
    })
  }
  //////////////////////////////////////////////////////////////
  if(command('*bw3', message)){
    discordid=message.member.id
    let query2 = `SELECT * FROM names WHERE discid = ?`
    db.get(query2, [discordid], (err, row) => {
      if(err){
        console.log(err)
        return
      }
      let args = message.content.split(" ")
      name1 = args[1]
      arr = []
      if(name1===undefined&&message.member!=null){
        if(row===undefined){
          message.channel.send("Unlinked player. Use *link [ign] and make sure your discord is linked to hypixel")
          return
        }
        else{name1=row.username}
      }
      const canvas = Canvas.createCanvas(800, 500)
      registerFont('./font.ttf', { family: 'font' })
      const ctx = canvas.getContext('2d')
      async function bckgrnd(){
        const background = await Canvas.loadImage('wallpaper.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      }
      bckgrnd()
      // const player = await Canvas.loadImage(skin + uuid)
      //ctx.drawImage(player, 265, 75,250,400)
      ctx.font = '32px font';
      ctx.textAlign = "start";
      ctx.fillStyle = "white";
      getDatan(name1).then(data =>{
        games=data.player.stats.Bedwars.four_three_games_played_bedwars
        if(games==undefined){
          games=0
        }
        level=data.player.achievements.bedwars_level
        wins=data.player.stats.Bedwars.four_three_wins_bedwars
        finalsk = data.player.stats.Bedwars.four_three_final_kills_bedwars
        finalsd=data.player.stats.Bedwars.four_three_final_deaths_bedwars
        beds = data.player.stats.Bedwars.four_three_beds_broken_bedwars
        if(finalsk==undefined){
          finalsk=0
        }
        kd=(finalsk/finalsd).toFixed(2)
        if(finalsd==undefined){
          finalsd=0
          kd=finalsk.toFixed(2)
        }
        winstreak=data.player.stats.Bedwars.four_three_winstreak
        if(wins==undefined){
          wins=0
          winstreak=0
        }
        uuid=(skin) + (data.player.uuid)
        bedlosts=data.player.stats.Bedwars.four_three_beds_lost_bedwars
        losses=data.player.stats.Bedwars.four_three_losses_bedwars
        wlr=(wins/losses).toFixed(2)
        if(losses==undefined){
          wlr=wins.toFixed(2)
          losses=0
        }
        regkills=data.player.stats.Bedwars.four_three_kills_bedwars
        regdeaths=data.player.stats.Bedwars.four_three_deaths_bedwars
        if(regkills==undefined){
          regkills=0
        }
        regkdr=(regkills/regdeaths).toFixed(2)
        if(regdeaths==undefined){
          regkdr=regkills.toFixed(2)
          regdeaths=0
        }
        if(beds==undefined){
          beds=0
        }
        bblr = (beds/bedlosts).toFixed(2)
        if(bedlosts==undefined){
          bblr=beds.toFixed(2)
          bedlosts=0
        }
        displayname=data.player.displayname
        if(data.player.newPackageRank===undefined){
          rank='non'
        }
        if(data.player.newPackageRank==='VIP'){
          rank='VIP'
        }
        if(data.player.newPackageRank==='VIP_PLUS'){
          rank='VIP+'
        }
        if(data.player.newPackageRank==='MVP'){
          rank='MVP'
        }
        if(data.player.newPackageRank==='MVP_PLUS'){
          rank='MVP+'
        }
        if(data.player.monthlyPackageRank==='SUPERSTAR'){
          rank = 'MVP++'
        }
        ctx.fillText('Games: ' + games, 25, 125)
        ctx.fillText('Winstreak: ' + winstreak, 510, 125)
        ctx.fillText('Wins: ' + wins, 25, 175)
        ctx.fillText('Losses: ' + losses, 25, 225)
        ctx.fillText('WLR: ' + wlr, 25, 275)
        ctx.fillText('Final Kills: ' + finalsk, 25, 325) 
        ctx.fillText('Final KD: ' + kd, 25, 425)
        ctx.fillText('Beds: ' + beds, 510, 175)
        ctx.fillText('Beds Lost: ' + bedlosts, 510, 225)
        ctx.fillText('Final Deaths: ' + finalsd, 25, 375)  
        ctx.fillText('BBLR: ' + bblr, 510, 275)
        ctx.fillText('Kills: ' + regkills, 510, 325)
        ctx.fillText('Deaths: ' + regdeaths, 510, 375)
        ctx.fillText('KD: ' + regkdr, 510, 425)
        ctxcol="#696969"
        ctx.textAlign = "center";
        ctx.fillText('Level: ' + level, 400, 67) 
        if(rank=='non'){
          ctx.fillStyle = "#5e5e5e"
          ctx.fillText(displayname,400,32)
        }
        if(rank=='VIP'||rank=='VIP+'){
          ctx.fillStyle = "#34eb40"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        if(rank=='MVP'||rank=='MVP+'){
          ctx.fillStyle = "#1eaee3"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)       
        }
        if(rank=='MVP++'){
          ctx.fillStyle = "orange"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function player(){
          const player = await Canvas.loadImage(uuid);
          await ctx.drawImage(player, 265, 75,250,400);
          //console.log(player)
        }
        player()
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        sleep(1000)
          .then(() => {
            //console.log("woo")
            const attachment = new Discord.MessageAttachment(canvas.toBuffer())
            message.channel.send(attachment)
          })
      }).catch(function () {
        message.channel.send("Name incorrect/Nicked");
      });
    })
  }
  ///////////////////////////////////////////////////////////
  if(command('*bw4', message)){
    discordid=message.member.id
    let query2 = `SELECT * FROM names WHERE discid = ?`
    db.get(query2, [discordid], (err, row) => {
      if(err){
        console.log(err)
        return
      }
      let args = message.content.split(" ")
      name1 = args[1]
      arr = []
      if(name1===undefined&&message.member!=null){
        if(row===undefined){
          message.channel.send("Unlinked player. Use *link [ign] and make sure your discord is linked to hypixel")
          return
        }
        else{name1=row.username}
      }
      const canvas = Canvas.createCanvas(800, 500)
      registerFont('./font.ttf', { family: 'font' })
      const ctx = canvas.getContext('2d')
      async function bckgrnd(){
        const background = await Canvas.loadImage('wallpaper.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      }
      bckgrnd()
      // const player = await Canvas.loadImage(skin + uuid)
      //ctx.drawImage(player, 265, 75,250,400)
      ctx.font = '32px font';
      ctx.textAlign = "start";
      ctx.fillStyle = "white";
      getDatan(name1).then(data =>{
        games=data.player.stats.Bedwars.four_four_games_played_bedwars
        if(games==undefined){
          games=0
        }
        level=data.player.achievements.bedwars_level
        wins=data.player.stats.Bedwars.four_four_wins_bedwars
        finalsk = data.player.stats.Bedwars.four_four_final_kills_bedwars
        finalsd=data.player.stats.Bedwars.four_four_final_deaths_bedwars
        beds = data.player.stats.Bedwars.four_four_beds_broken_bedwars
        if(finalsk==undefined){
          finalsk=0
        }
        kd=(finalsk/finalsd).toFixed(2)
        if(finalsd==undefined){
          finalsd=0
          kd=finalsk.toFixed(2)
        }
        winstreak=data.player.stats.Bedwars.four_four_winstreak
        if(wins==undefined){
          wins=0
          winstreak=0
        }
        uuid=(skin) + (data.player.uuid)
        bedlosts=data.player.stats.Bedwars.four_four_beds_lost_bedwars
        losses=data.player.stats.Bedwars.four_four_losses_bedwars
        wlr=(wins/losses).toFixed(2)
        if(losses==undefined){
          wlr=wins.toFixed(2)
          losses=0
        }
        regkills=data.player.stats.Bedwars.four_four_kills_bedwars
        regdeaths=data.player.stats.Bedwars.four_four_deaths_bedwars
        if(regkills==undefined){
          regkills=0
        }
        regkdr=(regkills/regdeaths).toFixed(2)
        if(regdeaths==undefined){
          regkdr=regkills.toFixed(2)
          regdeaths=0
        }
        if(beds==undefined){
          beds=0
        }
        bblr = (beds/bedlosts).toFixed(2)
        if(bedlosts==undefined){
          bblr=beds.toFixed(2)
          bedlosts=0
        }
        displayname=data.player.displayname
        if(data.player.newPackageRank===undefined){
          rank='non'
        }
        if(data.player.newPackageRank==='VIP'){
          rank='VIP'
        }
        if(data.player.newPackageRank==='VIP_PLUS'){
          rank='VIP+'
        }
        if(data.player.newPackageRank==='MVP'){
          rank='MVP'
        }
        if(data.player.newPackageRank==='MVP_PLUS'){
          rank='MVP+'
        }
        if(data.player.monthlyPackageRank==='SUPERSTAR'){
          rank = 'MVP++'
        }
        ctx.fillText('Games: ' + games, 25, 125)
        ctx.fillText('Winstreak: ' + winstreak, 510, 125)
        ctx.fillText('Wins: ' + wins, 25, 175)
        ctx.fillText('Losses: ' + losses, 25, 225)
        ctx.fillText('WLR: ' + wlr, 25, 275)
        ctx.fillText('Final Kills: ' + finalsk, 25, 325) 
        ctx.fillText('Final KD: ' + kd, 25, 425)
        ctx.fillText('Beds: ' + beds, 510, 175)
        ctx.fillText('Beds Lost: ' + bedlosts, 510, 225)
        ctx.fillText('Final Deaths: ' + finalsd, 25, 375)  
        ctx.fillText('BBLR: ' + bblr, 510, 275)
        ctx.fillText('Kills: ' + regkills, 510, 325)
        ctx.fillText('Deaths: ' + regdeaths, 510, 375)
        ctx.fillText('KD: ' + regkdr, 510, 425)
        ctxcol="#696969"
        ctx.textAlign = "center";
        ctx.fillText('Level: ' + level, 400, 67) 
        if(rank=='non'){
          ctx.fillStyle = "#5e5e5e"
          ctx.fillText(displayname,400,32)
        }
        if(rank=='VIP'||rank=='VIP+'){
          ctx.fillStyle = "#34eb40"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        if(rank=='MVP'||rank=='MVP+'){
          ctx.fillStyle = "#1eaee3"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)       
        }
        if(rank=='MVP++'){
          ctx.fillStyle = "orange"
          ctx.fillText(`[`+rank+'] '+displayname,400,32)
        }
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function player(){
          const player = await Canvas.loadImage(uuid);
          await ctx.drawImage(player, 265, 75,250,400);
          //console.log(player)
        }
        player()
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        sleep(1000)
          .then(() => {
            //console.log("woo")
            const attachment = new Discord.MessageAttachment(canvas.toBuffer())
            message.channel.send(attachment)
          })
      }).catch(function () {
        message.channel.send("Name incorrect/Nicked");
      });
    })
  }
  /////////////////////////////////////////////////////////////////
    if(command('*insert', message)&&message.author.id=='231498804359200769'){
    let args = message.content.split(" ")
    name1 = args[1]
    arr = []
    getDatan(name1).then(data =>{
      games=data.player.stats.Bedwars.games_played_bedwars
      level=data.player.achievements.bedwars_level
      wins=data.player.stats.Bedwars.wins_bedwars
      finalsk = data.player.stats.Bedwars.final_kills_bedwars
      finalsd=data.player.stats.Bedwars.final_deaths_bedwars
      beds = data.player.stats.Bedwars.beds_broken_bedwars
      kd=(finalsk/finalsd).toFixed(2)
      if(finalsd==undefined){
        finalsd==0
        kd=finalsk.toFixed(2)
      }
      winstreak=data.player.stats.Bedwars.winstreak
      uuid=(data.player.uuid)
      bedlost=data.player.stats.Bedwars.beds_lost_bedwars
      index = ((kd*kd)*level).toFixed(0)
      displayname=data.player.displayname
      //discord=data.player.socialMedia.links.DISCORD
      //tag=message.member.user.tag
      //discordid=message.member.id
      var d = new Date()
      epoc = d.getTime()
      let query2 = `SELECT * FROM data WHERE userid = ?`
      db.get(query2, [uuid], (err, row) => {
        if(err){
          console.log(err)
          return
        }
        if(row===undefined){
          let insertdata = db.prepare(`INSERT INTO data VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          insertdata.run(uuid,displayname,games,level,wins,finalsk,finalsd,beds,kd,winstreak,bedlost,index,epoc)
          insertdata.finalize()
          db.close
          return;
        }
      })
    }).catch(function () {
      message.channel.send("Error linking name");
    });
  }
  /////////////////////////////////////////////
  if(msg=="*invite"){
    message.channel.send("https://discord.com/api/oauth2/authorize?client_id=795139143687733250&permissions=8&scope=bot")
  }
})
client.login(token)