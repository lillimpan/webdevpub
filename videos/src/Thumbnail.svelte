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
    padding: 20px;
    font-size: 30px;
    text-align: center;
    height: 80px;
    background-size: cover; /* Resize the background image to cover the entire container */
  }

</style>