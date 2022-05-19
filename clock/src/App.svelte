<link href="https://fonts.googleapis.com/css?family=Dancing Script" rel="stylesheet" type="text/css">
<link href="https://fonts.googleapis.com/css?family=Road Rage" rel="stylesheet" type="text/css">
<link href="https://fonts.googleapis.com/css?family=Yanone Kaffeesatz" rel="stylesheet" type="text/css">
<link href="https://fonts.googleapis.com/css?family=Merienda" rel="stylesheet" type="text/css">
<script>

    import { Clock } from "./Klocka";
    import { fade, fly, slide, draw } from "svelte/transition";
    import { spring, tweened } from "svelte/motion"
    let clock = new Clock(8, 20);
    let clock2 = new Clock(13, 37);
    let clock3 = new Clock(21, 44);
    var alarmTime = 0;
    
    $:hour = spring(clock2.hour)
    
    $: minute = spring(
        parseInt(clock.time.hour) * 60 + parseInt(clock.time.minute)
    );
    
let i = 0;
    function tick() 
    {
        clock.tick();
        clock = clock;
        if (clock.timeRe == alarmTime){
            Alarm()
        }
        i++;
        

        clock2.tick();
        clock2 = clock2;
        i++;
        hour.set(clock2.hour);
        minute.set(clock2.minute)
        if (clock2.timeRe == alarmTime){
            Alarm()
        }

        clock3.tick();
        clock3 = clock3;
        minute.set(clock3.hour)
        if (clock3.timeRe == alarmTime){
            Alarm()
        }
        i++;

    }
    setInterval(tick, 1000);

    function setAlarmTime()
    {
        alarmTime = document.getElementById("alarm-time").value;
        document.getElementById("alarm-text").innerText = "Alarm Is Set" + " " + document.getElementById("alarm-time").value;

    }

    function Alarm (){
        document.getElementById("alarm-text").innerText =  ("Wake Up!!!")
    }

	
</script>

<main>
    <div class="kolumner">

    <p id ="tid">
        Time: {#key clock.time.hour}
        <span in:fly={{ y: -20 }}>
            {clock.time.hour}
        </span>
    {/key}
    <span>:</span>
    {#key clock.time.minute}
        <span in:fly={{ y: -20 }}>
            {clock.time.minute}
        </span>
    {/key}
    </p>


    <button on:click={tick}> + Seconds </button>
    


    </div>

    <div class="kolumner">

        <svg viewBox="-50 -50 100 100" class="clock-face" style="background-size: 300% 300%; border-radius: 50%;">
            <circle class="clock-face" r="0"  />
    
            {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minutes}
                <line
                    class="hour"
                    y1="40.5"
                    y2="49.5"
                    transform="rotate({30 * minutes})"
                />
    
                {#each [1, 2, 3, 4] as offset}
                    <line
                        class="hour"
                        y1="44.2"
                        y2="49.5"
                        transform="rotate({6 * (minutes + offset)})"
                    />
                {/each}
            {/each}
    
            <line
                class="hour"
                y1="-4"
                y2="33"
                transform="rotate({180 + 6 * clock.minute})"
            />
    
            <line
                class="hour"
                y1="-4"
                y2="28"
                transform="rotate({180 + (6 / 12) * (clock.hour * 60 + clock.minute)})"
            />
        </svg>

        <p>
           Time: {#key clock.time.hour}
            <span in:fly={{ y: -20 }}>
                {clock.time.hour}
            </span>
        {/key}
        <span>:</span>
        {#key clock.time.minute}
            <span in:fly={{ y: -20 }}>
                {clock.time.minute}
            </span>
        {/key}
        </p>

        
        <button id = "Set-Alarm">
            <input type="time" id ="alarm-time" class="center" name="alarm-time">
        </button>
       
        <button id= "Set-Alarm">
            <input id ="alarm-time" class="center" type="button" value= "Set Alarm" on:click={setAlarmTime}>
        </button>


        <p id = "alarm-text">
            alarm is not triggerd
        </p>


    </div>
    <div>

        <svg id="clock3" width="80" height="200">

            <rect x= "0" y= "{198 - clock.hour * 8.53}" width="100%" height="200" style="fill:rgb(0,200,240);stroke:rgb(0,150,240)" />
    
            <rect x= "0" y= "0" width="100%" height="100%" style="fill:none;stroke:rgb(0,0,0)" />
        </svg> 

        <svg id = "clock3" width="80" height="200">
            <rect x= "0" y= "{202 - clock.minute*3.31}" width="100%" height="210" style="fill:rgb(0,200,240);stroke:rgb(0,150,240);" />
            <rect x= "0" y= "0" width="100%" height="100%" style="fill:none;stroke:rgb(0,0,0);" />
            
        </svg>

        
        <p>
            Time: {#key clock.time.hour}
            <span in:fly={{ y: -20 }}>
                {clock.time.hour}
            </span>
        {/key}
        <span>:</span>
        {#key clock.time.minute}
            <span in:fly={{ y: -20 }}>
                {clock.time.minute}
            </span>
        {/key}
        </p>

        <button on:click={tick}> + Seconds </button>
        
    </div>

</main>


<style>

    :global(html){
        height: 100%;
    }

    :global(body){
        margin:0;
        padding:0;
        height: 100%;
    }

    svg {
        width: 40%;
        height: 40%;
    }

    #clock3 {
        height: 200px;
        stroke: black;
        stroke-width: 3px;
        margin-top: 15px;

    }

    .clock-face {
        animation: movement 15s ease infinite;
        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
    }
    
    main 
    {
        
        display: flex;
		place-items: center;
        justify-content: center;
        align-content: center;
        margin: auto;
        height: 100%; 
        column-gap: 10vw;
        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        align-items: center;
        justify-content:center;
        gap: 50px;
        animation: movement 15s ease infinite;
        text-align: center;
        overflow: auto;
        
    }

    @keyframes movement {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    @media (max-width: 600px) {
        main {
            justify-content: start;
            flex-direction: column;

        }

    }
    .clock-face {
        height: 200px;
        width: 200px;
        border-radius: 50%;
    }

    .hour {
        stroke: #333;
        stroke-width: 0.8;
    }
    
    p {
        
        font-size: 3.5em;
        color: white;
        margin:0px;
        padding:auto;
        font-family:Yanone Kaffeesatz;
        
    }

    #tid {
        margin-top: 20px;
    }

	
    button
    {
		font-size: 3em;
		color:white;
		background: linear-gradient(-90deg, #ffffff, #f2d781, #EEB906, #EEB906, #f2d781, #ffffff);
        background-size: 300% 300%;
        animation: movement 15s ease infinite;
        border-radius: 50px;
        font-family: Road Rage;
        transition: height 0.2s;
        height: 100px;
	}
    button:hover{
        background:pink;
        height: 95px;
    }

    #Set-Alarm{
        font-size: 2.5em;
		color:white;
		background-color: #EEB906;
        border-radius: 50px;
        width: 70%;
        height: 100px;
        font-family: Road Rage;
    }
    #Set-Alarm:hover{
        background:pink;
        height: 95px;
    }

    .center {
        width: 75%;
        text-align: center;
        background-color: rgba(0,0,0,0.0);
        border: 0;
        color:white;
    }
    

</style>
