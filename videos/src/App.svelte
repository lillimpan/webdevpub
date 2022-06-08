<link href="https://fonts.googleapis.com/css?family=Zen Maru Gothic" rel="stylesheet" type="text/css">
<script>
  import { video_player_is_active } from "./stores.js";
  import { Button, Overlay } from "svelte-materialify";
  import { videos } from "./videos.js";
  import { videos2 } from "./videos.js";
  import { videos3 } from "./videos.js";
  import { videos4 } from "./videos.js";
  import { videos5 } from "./videos.js";
  import { videos6 } from "./videos.js";
  import { videos7 } from "./videos.js";
  import { videos8 } from "./videos.js";
  import Player from "./Player.svelte";
  import Thumbnail from "./Thumbnail.svelte";

  let is_fullscreen = false;
</script>

<main>
  
  <h1 id="title" ><img class="netflex" src="netflix2.png" id="logo" alt="symbole" width="110" height="80">                Netflex</h1>
  
  
  <h3 id="trendar">Trendar</h3>
  
  <div class="grid">
    {#each Array(7) as _, i}
        <!-- Probably here you want to show different videos than I have selected -->
        <Thumbnail video={videos[i%7]}> </Thumbnail>
    {/each}
  </div>

  <h3>Rekomenderat för dig</h3>
  <div class="grid">
    
    {#each Array(7) as _, i}
        <!-- Probably here you want to show different videos than I have selected -->
        <Thumbnail video={videos2[i%7]}> </Thumbnail>
    {/each}
  </div>
   
  <h3>Scräck</h3>
  <div class="grid">
    {#each Array(7) as _, i}
        <!-- Probably here you want to show different videos than I have selected -->
        <Thumbnail video={videos3[i%7]}> </Thumbnail>
    {/each}
  </div>

  <h3>Humor</h3>
  <div class="grid">
    {#each Array(7) as _, i}
        <!-- Probably here you want to show different videos than I have selected -->
        <Thumbnail video={videos4[i%7]}> </Thumbnail>
    {/each}
  </div>

  <h3>Action</h3>
  <div class="grid">
    {#each Array(7) as _, i}
        <!-- Probably here you want to show different videos than I have selected -->
        <Thumbnail video={videos5[i%7]}> </Thumbnail>
    {/each}
  </div>

  <h3>Dramatik</h3>
  <div class="grid">
    {#each Array(7) as _, i}
        <!-- Probably here you want to show different videos than I have selected -->
        <Thumbnail video={videos6[i%7]}> </Thumbnail>
    {/each}
  </div>

  <h3>Dokumentär</h3>
  <div class="grid">
    {#each Array(7) as _, i}
        <!-- Probably here you want to show different videos than I have selected -->
        <Thumbnail video={videos7[i%7]}> </Thumbnail>
    {/each}
  </div>

  <h3>Ävetyr</h3>
  <div class="grid">
    {#each Array(7) as _, i}
        <!-- Probably here you want to show different videos than I have selected -->
        <Thumbnail video={videos8[i%7]}> </Thumbnail>
    {/each}
  </div>

  <Overlay
    opacity={is_fullscreen ? 1 : 0.7}
    color="black"
    active={$video_player_is_active}
    on:click={() => {
      $video_player_is_active = false;
    }}
  >
    <div
      id="video"
      class:fullscreen={is_fullscreen == true}
      on:click={(e) => {
        e.stopPropagation();
      }}
    >
      <div id="close">
        <Button
          class="error-color"
          size="small"
          on:click={() => {
            $video_player_is_active = false;
          }}
        >
          Close
        </Button>
      </div>
      <div id="fullscreen">
        <Button
          size="small"
          class="primary-color"
          on:click={() => {
            is_fullscreen = !is_fullscreen;
            // do not focus the fullscreenbutton if clicked
            // this is because otherwise clicking space will cause
            // the video player to maximize/minimize instead of pause/play
            // when space is clicked
            if (document.activeElement != document.body)
              document.activeElement.blur();
          }}
        >
          {is_fullscreen ? "Minimize" : "Theatre Mode"}
        </Button>
      </div>

      {#if is_fullscreen}
        <div id="gigascreen">
          <Button
            size="small"
            class="secondary-color"
            on:click={() => {
              // do not focus the fullscreenbutton if clicked
              // this is because otherwise clicking space will cause
              // the video player to maximize/minimize instead of pause/play
              // when space is clicked
              if (document.activeElement != document.body)
                document.activeElement.blur();

              let div = document.getElementById("vid");
              if (div.requestFullscreen) div.requestFullscreen();
              else if (div.webkitRequestFullscreen)
                div.webkitRequestFullscreen();
              else if (div.msRequestFullScreen) div.msRequestFullScreen();
            }}
          >
            {"Gigascreen"}
          </Button>
        </div>
      {/if}

      <Player />
    </div>
  </Overlay>

  <src />
</main>

<style>
  /* :global(:root) {
    --netflix-red: #ffffff;
    --netflix-red-opacity: rgba(229, 9, 20, 0.3);
  } */

  :global(body) {
    padding: 0;
    margin: 0;
    background-color: black;
  }

  main {
    min-height: 100vh;
    width: 100vw;
    background-color: rgb(0, 0, 0);
    padding-left: 5%;
    padding-right: 5%;
    box-sizing: border-box;
    padding-bottom: 60px;
  }

  #video {
    position: fixed;
    transition: all 0.3s ease-out;
    left: 15%;
    right: 15%;
    top: 15%;
    bottom: 15%;
  }

  #video.fullscreen {
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
  }

  #video.fullscreen #gigascreen {
    position: absolute;
    top: 10px; /* position the top  edge of the element at the middle of the parent */
    left: 50%; /* position the left edge of the element at the middle of the parent */

    transform: translate(-50%, 0);
    z-index: 100;
  }
  #video #close {
    position: absolute;
    top: -10px;
    right: -10px;
    z-index: 100;
  }

  #video #fullscreen {
    position: absolute;
    top: -10px;
    left: -10px;
    z-index: 100;
  }

  #video.fullscreen #close {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
  }

  #video.fullscreen #fullscreen {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
  }

  .grid {
    display: grid;
    grid-row-gap: 50px;
    grid-column-gap: 50px;
    grid-template-columns: auto auto auto auto auto auto auto;
    padding: 10px;
    overflow-x: scroll;
    overflow-y:visible;
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
   

  }

  .grid::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
}

 

  #title {
    color: rgb(230, 5, 5);
    font-size: 90px;
    line-height: 100px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.8);
    box-shadow: 15px 40px 10px rgba(0, 0, 0, 0.8);
    height: 120px;
    padding-left: calc(5% + 5px);
    align-items: center;
    /* border-bottom: 5px solid rgb(17, 17, 17); */
    font-weight: 700;
    padding-top: 25px;
    font-size: 70px;
  }

  h3{
    margin-top: 100px;
    color: rgb(207, 207, 207);
    font-weight:600;
    border-top: 10px solid rgb(29, 29, 29);
    margin-top:110px;
    font-family: Zen Maru Gothic;
    font-size: 40px;
    margin-bottom: 50px;
  }
  #trendar{
    padding-top: 120px;
    color: rgb(207, 207, 207);
  }
  #logo{
    margin-top: 10px;
  }

  @media (max-width: 600px) {
        #fullscreen {
            padding-right: 40px;
        }
    }
  
    @media (max-width: 600px) {
        #title {
            font-size: 300%;
            padding-bottom: 1px;
        }
    }

    @media (max-width: 600px) {
        .netflex {
            height: 50%;
            width: 20%;
        }
    }

    @media (max-width: 600px) {
        .grid {
          grid-row-gap: 10px;
          grid-column-gap: 10px;
          padding-bottom: 10px;
          padding-top: 10px;
        }
    }

    @media (max-width: 600px) {
        main {
          padding-left: 3%;
          padding-right: 3%;
          padding-top: 2%;
        }
    }

    @media (max-width: 600px) {
      h3{
        margin-top:10px;
        font-size: 200%;
      }
    }

</style>
