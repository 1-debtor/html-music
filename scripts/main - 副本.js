document.addEventListener('DOMContentLoaded', function() {
  const songs = [
    { 
      title: '1', 
      file: 'assets/music/1.mp3', 
      lyricsFile: 'assets/lyrics/1.txt' 
    },
    // ... Add more song objects as needed
  ];

  const audioPlayer = document.getElementById('audioPlayer'); // Reference to audio player
  const songListElement = document.getElementById('songList');
  const lyricsElement = document.getElementById('lyrics');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const volumeControl = document.getElementById('volumeControl');

  let isPlaying = false;
  let currentSongIndex = -1; // To track the current song

  // Populate song list
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.textContent = song.title;
    li.classList.add('cursor-pointer', 'hover:text-gray-300', 'py-2');
    li.addEventListener('click', () => {
      playSong(index);
    });
    songListElement.appendChild(li);
  });

  // Function to play a song
  function playSong(index) {
    if (currentSongIndex !== index) {
      currentSongIndex = index;
      const song = songs[index];
      audioPlayer.src = song.file; // Set the source of the audio player
      loadLyrics(song.lyricsFile); // Fetch and display lyrics
      audioPlayer.play(); // Play the song
      isPlaying = true;
    } else {
      togglePlayPause(); // Play/Pause the current song
    }
    updatePlayPauseButton();
  }

  // 修改 loadLyrics 函数以支持歌词滚动显示
  function loadLyrics(lyricsFilePath) {
    fetch(lyricsFilePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.text();
      })
      .then(lyrics => {
        const lyricsArray = lyrics.split('\n'); // 假设每行歌词由换行符分隔
        displayLyrics(lyricsArray, 0); // 初始显示从第一行开始的10行歌词
        // 当歌曲播放时，更新歌词显示
        audioPlayer.ontimeupdate = () => {
          // 这里的逻辑需要根据歌词时间戳来调整，以下为简化示例
          const lineToShow = Math.floor(audioPlayer.currentTime / audioPlayer.duration * lyricsArray.length);
          displayLyrics(lyricsArray, lineToShow);
        };
      })
      .catch(error => {
        console.error('Error loading the lyrics:', error);
        lyricsElement.textContent = 'Lyrics not found.';
      });
  }

  // 新增一个函数来处理歌词的显示逻辑
  function displayLyrics(lyricsArray, startIndex) {
    lyricsElement.innerHTML = ''; // 清空当前歌词
    // 计算结束索引，确保不会超出歌词数组的范围
    let endIndex = startIndex + 10;
    if (endIndex > lyricsArray.length) endIndex = lyricsArray.length;
    // 从 startIndex 到 endIndex 显示歌词
    for (let i = startIndex; i < endIndex; i++) {
      const p = document.createElement('p');
      p.textContent = lyricsArray[i];
      lyricsElement.appendChild(p);
    }
  }


  // Function to update the play/pause button icon
  function updatePlayPauseButton() {
    playPauseBtn.innerHTML = isPlaying
      ? '<img src="https://img.icons8.com/ios-filled/50/ffffff/pause--v1.png" alt="Pause" class="w-6 h-6">'
      : '<img src="https://img.icons8.com/ios-filled/50/ffffff/play--v1.png" alt="Play" class="w-6 h-6">';
  }

  // Function to toggle play/pause
  function togglePlayPause() {
    if (audioPlayer.src) {
      isPlaying = !isPlaying;
      if (isPlaying) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
      updatePlayPauseButton();
    }
  }

  playPauseBtn.addEventListener('click', togglePlayPause);

  // Adjust volume
  volumeControl.addEventListener('input', (event) => {
    const volume = event.target.value / 100;
    audioPlayer.volume = volume; // Adjust the volume of the audio player
  });

  // Update the play/pause button when the song ends
  audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayPauseButton();
  });
});
