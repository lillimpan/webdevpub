<link href="https://fonts.googleapis.com/css?family=Permanent Marker" rel="stylesheet" type="text/css">
<script>
    import Spinner from "./Spinner.svelte";
    import Results from "./Results.svelte";
    import Search from "./Search.svelte";
    import { promise } from "./stores.js";


</script>

<main class:smaller={$promise!=undefined}>
    <div id="namn" class:smaller={$promise!=undefined}>
        <div class="E">E</div>
        <div class="L" style="transform: translate(60px, -49px)">L</div>
        <div class="O" style="transform: translate(120px, -99px)">O</div>
        <div class="G" style="transform: translate(190px, -149px">G</div>
    </div>


    <Search/>

    {#await $promise}
        <Spinner />
    {:then result}
        <Results json={result} />
    {:catch error}
        <div>
            <h3 id="error" style="color: black">No Internet Connection <img src="internet.png" id="internet-symbole" alt="internet" width="30" height="30"></h3>
        </div>
    {/await}
    
</main>

<style>


    :global(body) {
        padding: 0;
        margin: 0;
    }
    main {
        height: 100vh;
        width: 100vw;
        background: linear-gradient(-45deg, #ffffff, #ffffff);
        background-size: 400% 400%;
        animation: gradient 15s ease infinite;
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;
        animation: gradient 0s ease infinite;
        gap: 50px;
        padding-top: 0%;
        padding-left: 0%;
        padding-right: 0%;
        box-sizing: border-box;
        
    }

    main.smaller {
        padding-top: 0%;
    }

    #internet-symbole {
        margin-bottom: -8px;
    }




    .E {
        font-size: 80px;
        color:rgb(13, 108, 252);
        font-family: Permanent Marker;
        padding-top: 0px;
        height: 50px;
        margin-top:0;
    }

    .L {
        font-size: 80px;
        color:rgb(233, 20, 20);
        font-family: Permanent Marker;
        padding-top: 0px;
        height: 50px;
        margin-top:0;
    }

    .O {
        font-size: 80px;
        color:rgb(250, 224, 28);
        font-family: Permanent Marker;
        padding-top: 0px;
        height: 50px;
        margin-top:0;
    }

    .G {
        font-size: 80px;
        color:rgb(17, 206, 7);
        font-family: Permanent Marker;
        padding-top: 0px;
        height: 50px;
        margin-top:0;
    }

    #namn {
        transform: translate(-100px, 50px);
        padding-top: -30px;
        transition: all 1s;
    }

    #namn.smaller {
        height: 150px;
        /* transform: translate(-825px, 50px); */
        font-size: small;
        margin-top:-50px;

    }

    #error{
        position:relative;
        justify-content: center;
        align-items: center;
        display: flex;
        animation: fadeIn ease 10s;
        -webkit-animation: fadeIn ease 1s;
        margin-right: 10px;
    }
    

    @keyframes gradient {
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

    @keyframes fadeIn {
    0% {
        opacity:0;
    }
    100% {
        opacity:1;
    }
    }

    @-webkit-keyframes fadeIn {
    0% {
        opacity:0;
    }
    100% {
        opacity:1;
    }
    }


    @media (max-width: 600px) {
        main {
            justify-content: start;
            flex-direction: column;
            position: absolute;
            margin: auto;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;

        }
    }

    @media (max-width: 1800px) {
        #error {
            margin-bottom: 1000px;
            margin-left: 80px;
            display: flex;
        }
    }

    @media (max-width: 600px) {
        #error {
            width: 100%;
            margin-bottom: 1000px;
            margin-left: 4px;
            font-size: 80%;
        }
    }

</style>