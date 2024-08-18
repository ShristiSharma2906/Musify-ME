let currentSong = new Audio();
let songs = [];
let currFolder = "songs/ncs"; // Default folder, adjust as needed
let blobUrls = {}; // Store blob URLs for added songs

// Function to convert seconds to minutes and seconds
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch and display songs from a folder
async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`/${folder}/`);
        if (!response.ok) throw new Error(`Failed to fetch songs: ${response.statusText}`);
        let textResponse = await response.text();
        let div = document.createElement("div");
        div.innerHTML = textResponse;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }

        // Show all the songs in the library
        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = ""; // Clear previous songs
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" width="34" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </li>`;
        }

        // Attach an event listener to each song
        Array.from(songUL.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            });
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        alert("Failed to load songs. Please check the console for more details.");
    }
}

// Function to play music
const playMusic = (track, pause = false) => {
    let src = blobUrls[track] || (`/${currFolder}/` + track);
    currentSong.src = src;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

// Function to display albums
async function displayAlbums() {
    console.log("Displaying albums...");
    try {
        let response = await fetch(`/songs/`);
        if (!response.ok) throw new Error(`Failed to fetch albums: ${response.statusText}`);
        let textResponse = await response.text();
        let div = document.createElement("div");
        div.innerHTML = textResponse;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        console.log("Found anchors:", anchors.length);

        cardContainer.innerHTML = ''; // Clear existing cards before adding new ones

        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/songs/")) {
                let folder = e.href.split("/").slice(-1)[0];
                try {
                    let metaResponse = await fetch(`/songs/${folder}/info.json`);
                    if (!metaResponse.ok) throw new Error(`Failed to fetch metadata: ${metaResponse.statusText}`);
                    let metaData = await metaResponse.json();
                    console.log(`Adding card for ${folder}:`, metaData);

                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <h2>${metaData.title}</h2>
                            <p>${metaData.description}</p>
                        </div>`;
                } catch (error) {
                    console.error(`Error fetching metadata for ${folder}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching albums:", error);
        alert("Failed to load albums. Please check the console for more details.");
    }

    // Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            try {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            } catch (error) {
                console.error("Error while fetching songs from the card:", error);
                alert("Failed to load songs from the selected album.");
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    main();
});

// Function to normalize a string for searching
function normalizeString(str) {
    let normalized = str.toLowerCase();
    normalized = normalized.replace(/[\W_]+/g, ' ').trim();
    return normalized;
}

// Function to search for a song
function searchSong(query) {
    const normalizedQuery = normalizeString(query);

    const foundSong = songs.find(song => {
        const normalizedSong = normalizeString(song);
        return normalizedSong.includes(normalizedQuery);
    });

    if (foundSong) {
        playMusic(foundSong);
    } else {
        alert('Song not found in the playlist.');
    }
}

// Main function to initialize the app
async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        console.log("previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to ", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("img/mute.svg", "img/volume.svg");
        }
    });

    document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    document.querySelector(".search").addEventListener("input", (e) => {
        const query = e.target.value.trim();
        searchSong(query);
    });

    document.getElementById("searchOption").addEventListener("click", () => {
        document.querySelector(".search").focus();
    });

    document.querySelector(".heading img[src='img/plus.svg']").addEventListener("click", () => {
        document.getElementById("fileInput").click();
    });

    document.getElementById("fileInput").addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.includes("audio/mpeg") && !file.type.includes("audio/mp3")) {
            alert("Only MP3 files are allowed.");
            return;
        }

        const blobUrl = URL.createObjectURL(file);
        const songName = file.name;

        blobUrls[songName] = blobUrl;

        const songList = document.querySelector(".songList ul");
        songList.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${songName.replaceAll("%20", " ")}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;

        songList.lastElementChild.addEventListener("click", () => {
            playMusic(songName);
        });
    });
}
