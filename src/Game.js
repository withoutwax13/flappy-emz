import React, { useState, useEffect } from "react";
import "./Game.css";
import emz from "./assets/emz.png";
import jumpSoundFile from "./assets/huh.mp3";
import hitSoundFile from "./assets/laugh.mp3";

let audioContext = new (window.AudioContext || window.webkitAudioContext)();

function loadSound(url, callback) {
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    audioContext.decodeAudioData(request.response, function(buffer) {
      callback(buffer);
    });
  }
  request.send();
}

let jumpSoundBuffer;
loadSound(jumpSoundFile, function(buffer) {
  jumpSoundBuffer = buffer;
});

let hitSoundBuffer;
loadSound(hitSoundFile, function(buffer) {
  hitSoundBuffer = buffer;
});

function playSound(buffer) {
    let source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);   
}

const jumpSound = new Audio('./assets/huh.mp3');
const hitSound = new Audio('./assets/laugh.mp3');

const Game = () => {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [birdHeight, setBirdHeight] = useState(300);
  const [pipes, setPipes] = useState([]);

  const gameHeight = 600;
  const gameWidth = 800;

  const birdWidth = 40;
  const pipeWidth = 100;
  const pipeGap = 200;

  const startGame = () => {
    setStarted(true);
    setScore(0);
    setPipes([{ x: 400, height: 0 }]);
  };

  const jump = () => {
    setBirdHeight((prevHeight) => prevHeight - 60);
    playSound(jumpSoundBuffer);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        if (!started) startGame();
        jump();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Remove event listener on cleanup
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [started]);

  const updateGame = () => {
    if (!started) return;

    // Update bird position
    setBirdHeight((prevHeight) => prevHeight + 5);

    // Update pipes position
    setPipes((prevPipes) => {
      const newPipes = prevPipes.map((pipe) => ({
        ...pipe,
        x: pipe.x - 5,
      }));

      // Add new pipe
      if (newPipes[newPipes.length - 1].x < 500) {
        const heightTop = Math.random() * (gameHeight - pipeGap);
        const heightBottom = gameHeight - heightTop - pipeGap;
        newPipes.push({
          x: 800,
          heightTop: heightTop,
          heightBottom: heightBottom,
        });
      }

      // Remove passed pipes
      return newPipes.filter((pipe) => pipe.x > -pipeWidth);
    });

    // Check collision
    const birdTop = birdHeight;
    const birdBottom = birdHeight + birdWidth;
    const birdLeft = 100;
    const birdRight = 100 + birdWidth;

    const hit = pipes.some((pipe) => {
      const pipeTop = pipe.heightTop; // bottom of the top pipe
      const pipeBottom = pipe.heightTop + pipeGap; // top of the bottom pipe
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + pipeWidth;

      const withinPipeHorizontally =
        birdRight > pipeLeft && birdLeft < pipeRight;
      const hitTopPipe = withinPipeHorizontally && birdTop < pipeTop;
      const hitBottomPipe = withinPipeHorizontally && birdBottom > pipeBottom;

      return hitTopPipe || hitBottomPipe;
    });

    if (hit) {
      setStarted(false);
      playSound(hitSoundBuffer);
    }

    // Update score
    setScore((prevScore) => {
      let newScore = prevScore;
      pipes.forEach((pipe) => {
        if (
          pipe.x + pipeWidth < birdLeft &&
          pipe.x + pipeWidth + 5 >= birdLeft
        ) {
          newScore++;
        }
      });
      return newScore;
    });
  };

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        updateGame();
      }, 50);

      return () => clearInterval(interval);
    }
  }, [started, pipes]);

  return (
    <div
      className="Game"
      onClick={() => {
        if (!started) startGame();
        jump();
      }}
    >
      <div className="Score">Score: {score}</div>
      <div
        className="Bird"
        style={{
          top: `${birdHeight}px`,
          backgroundImage: `url(${emz})`,
          backgroundSize: "cover",
        }}
      ></div>
      {pipes.map((pipe, index) => (
        <React.Fragment key={index}>
          <div
            className="Pipe"
            style={{
              left: `${pipe.x}px`,
              height: `${pipe.heightBottom}px`,
              bottom: "0px",
            }}
          ></div>
          <div
            className="Pipe"
            style={{
              left: `${pipe.x}px`,
              height: `${pipe.heightTop}px`,
              top: "0px",
            }}
          ></div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Game;
