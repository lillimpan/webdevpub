<script>
    export let video;
    import { chosen_video, video_player_is_active } from "./stores.js";
</script>

<div
class="grid-item"
style="background-image: url({video.poster});"
on:click={() => {
  $chosen_video = video;
  $video_player_is_active = true;
}}
/>

<style>

.grid-item {
    cursor: pointer;
    background-color: var(--netflix-red-opacity);
    border: 1px solid var(--netflix-red);
    font-size: 30px;
    text-align: center;
    height: 450px;
    width: 300px;
    background-size: cover; /* Resize the background image to cover the entire container */
    border-radius: 5%;
    justify-content: center;
  }

  @media (max-width: 600px) {
        .grid-item {
           
            width: 120px;
            height: 180px;
        }
    }

</style>