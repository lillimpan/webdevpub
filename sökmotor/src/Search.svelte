<script>
    import { promise } from "./stores.js";
    let question;
    async function search() {
        const res = await fetch(
            `https://demo.dataverse.org/api/search?q=` + question
        );
        const json = await res.json();
         if (res.ok) {
            return json;
        } else {
            throw new Error(json);
        } 
    }

</script>
<div class:smaller={$promise!=undefined}>
    <form id = "sokbar"
        on:submit|preventDefault={async() => {
            $promise = search();
        }}
    >
        <input bind:value={question} placeholder="Search..."/>
        <span class="glas"><img src="search (1).png" id=glas alt="sök" width="30" height="30"></span>
    </form>
</div>

<style>
    div{
        gap: 10px;
        width: 50%;
        border-radius: 50px;
        padding-right: 10%;
        padding-left: 13%;
    }

    div.smaller{
        transition: all 1s;
    }

    input {
        width: 92%;
        border-color: white;
        padding-bottom: 10px;
        border-radius: 30%;
        margin: 800px 000px;
        outline: none;
        margin-left: 10px;
    }

    form {
        width: 900px;
        border-radius: 50px;
        height: 50px;
        position: block;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, .2);
        display: flex;
        align-items: center;
    }

    #sokbar:hover {
        box-shadow: 0px 0px 10px ;
        
    }

    span.glas{
        background-position: center;
        background-repeat: no-repeat;
        background-attachment:scroll;
        margin-bottom: -4px;
    }

    @media (max-width: 2000px) {
        span.glas {
            margin-right: 10px;
        }
    }

    @media (max-width: 600px) {
        div {
            display: flex;
            width: 100%;
            height: 100%;
            margin-right: 110px;
        }
    }
    @media (max-width: 1800px) {
        div {
            display: flex;
            margin-left: 100px;
            width: 70%;
        }
    }

    @media (max-width: 600px) {
        div.smaller {
            margin-left: 100px;
            display: flex;
            
        }
    }
    



</style>