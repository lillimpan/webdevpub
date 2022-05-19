<script>
    export let json;
    import { fly, fade, slide, draw } from "svelte/transition";
    import { promise } from "./stores.js";
    console.log(json)
</script>

{#if json && "data" in json && "items" in json.data && json.data.items.length > 0}
    <div id = "item-holder">
        {#each json.data.items as item}
            {#if item.type == "dataverse"}
                <div id = "item">
                    {#each Object.entries(item) as [key, value]}
                        <!--p in:fade>{JSON.stringify(key)} {JSON.stringify(value)}</p-->
                    {/each}
                    <p>
                        {item.url}
                    </p>
                    
                    <p id="rubrik">
                        <a href="{item.url}">
                            {item.name}
                        </a>
                        
                    </p>
                    <p id= "fakta">
                        {item.description}
                    </p>
                    <p id="datum">
                        Published:
                        {item.published_at}
                    </p>
                </div>
            {/if}
        {/each}
    </div>
{:else if json}
    <div>
        <!--p in:fade>{JSON.stringify(json)}</p-->
        <h3>
            Invalid Search Request
        </h3>
    </div>
{/if}

<style>

    #item-holder {
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;
        overflow-y: scroll;
        box-sizing: border-box;
        padding-left: 21%;
        padding-right: 20%; 
        min-width: 100%;
        row-gap: 10px;
    }

    #item {
        border-radius: 25px;
        background-color: white;
        border: 2px solid white;
        padding: 18px;
        width: 100%;
        margin-top: 13px;
        margin-bottom: 17px;
        box-sizing: border-box;
        word-wrap: break-word;
        row-gap: 15px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, .2);
        animation: fadeIn ease 10s;
        -webkit-animation: fadeIn ease 1s;
    }

    h3 {
        transform: translate(-90px, 0px);
        animation: fadeIn ease 10s;
        -webkit-animation: fadeIn ease 1s;
        transition: all 1s;
        margin-left: 160px;
    }

    p {
        padding: 5px;
        color: black;
        margin: 3px;
    }

    #rubrik {
        font-weight: bolder;
        font-size: 25px;
        color:black;
        margin: 3px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical; 
        overflow: hidden;
        text-overflow: ellipsis;
    }

    a {
        color:black
    }

    #fakta {
        font-weight: bolder;
        margin: 3px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical; 
        overflow: hidden; 

        }

    a:hover {
        text-decoration: underline;
        color:rgb(6, 6, 189);
    }

    #datum{
        width: 153px;
        white-space: nowrap;
        overflow: hidden;
    }

    ::-webkit-scrollbar {
        width: 15px;
        height: 15px;
    }

    ::-webkit-scrollbar-thumb {
        background-image: linear-gradient(45deg, #aaa9a9, #d8d4d4 );
        border-radius: 10px;
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
        ::-webkit-scrollbar {
            height: 0;
            width: 0;
        }
    }

    @media (max-width: 1800px) {
        #item-holder {
            display: flex;
            margin-right: 100px;
            margin-left: 165px;
            width: 100%;
        }
    }

    @media (max-width: 600px) {
        #item-holder {
            display: flex;
            margin-right: 100px;
            margin-left: 96px;
            padding-bottom: 130%;
            padding-top: -40px;
        }
    }

    @media (max-width: 600px) {
        p {
        font-size: 62%;
    
        }
    }

    @media (max-width: 600px) {
        #rubrik {
        font-size: 72%;
        }
    }

    @media (max-width: 600px) {
        #fakta {
        font-size: 72%;
        }
    }

    @media (max-width: 600px) {
        h3 {
        display: flex;
        font-size: 80%;
        width: 100%;
        margin-bottom: 1000px;
        padding-right:50px;
        
        }
    }

    @media (max-width: 1800px) {
        h3 {
        display: flex;
        align-items: center;;
        margin-left:250px;
        margin-right: 100px;
        }
    }

    @media (max-width: 600px) {
        #datum {
        align-items: center;
        width: 113px;
        overflow: hidden;
        }
    }


</style>
