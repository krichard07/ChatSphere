import { useEffect, useRef, useState } from "react";
import {
    BsPlayFill,
    BsPauseFill,
} from "react-icons/bs";

import "./VoiceMessage.css";

const BACKEND_URL = "http://127.0.0.1:8000";

function VoiceMessage({ attachment }) {
    const audioRef = useRef(null);
    const waveformRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [waveform, setWaveform] = useState([]);

    const audioUrl = `${BACKEND_URL}${attachment.file}`;

    /*
     * =========================
     * WAVEFORM GENERÁLÁS
     * =========================
     */

    useEffect(() => {
        let cancelled = false;
        let audioContext = null;

        const generateWaveform = async () => {
            try {
                const response = await fetch(audioUrl);
                const arrayBuffer = await response.arrayBuffer();

                const AudioContextClass =
                    window.AudioContext ||
                    window.webkitAudioContext;

                if (!AudioContextClass) {
                    return;
                }

                audioContext = new AudioContextClass();

                const audioBuffer =
                    await audioContext.decodeAudioData(
                        arrayBuffer
                    );

                if (cancelled) {
                    return;
                }

                const channelData =
                    audioBuffer.getChannelData(0);

                const sampleCount = 120;

                const blockSize = Math.max(
                    1,
                    Math.floor(
                        channelData.length /
                            sampleCount
                    )
                );

                const values = [];

                for (
                    let i = 0;
                    i < sampleCount;
                    i++
                ) {
                    const start =
                        i * blockSize;

                    const end = Math.min(
                        start + blockSize,
                        channelData.length
                    );

                    let sum = 0;

                    for (
                        let j = start;
                        j < end;
                        j++
                    ) {
                        sum += Math.abs(
                            channelData[j]
                        );
                    }

                    const average =
                        end > start
                            ? sum /
                              (end - start)
                            : 0;

                    values.push(average);
                }

                const max =
                    Math.max(...values, 0.01);

                const normalized =
                    values.map(
                        (value) =>
                            value / max
                    );

                setWaveform(normalized);
                setDuration(
                    audioBuffer.duration
                );
            } catch (error) {
                console.error(
                    "Voice waveform hiba:",
                    error
                );
            } finally {
                if (audioContext) {
                    audioContext.close();
                }
            }
        };

        generateWaveform();

        return () => {
            cancelled = true;

            if (audioContext) {
                audioContext.close();
            }
        };
    }, [audioUrl]);

    /*
     * =========================
     * AUDIO
     * =========================
     */

    const togglePlayback = () => {
        if (!audioRef.current) {
            return;
        }

        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) {
            return;
        }

        setCurrentTime(
            audioRef.current.currentTime
        );
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) {
            return;
        }

        if (
            Number.isFinite(
                audioRef.current.duration
            )
        ) {
            setDuration(
                audioRef.current.duration
            );
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    /*
     * =========================
     * SEEK
     * =========================
     */

    const seekAudio = (clientX) => {
        if (
            !waveformRef.current ||
            !audioRef.current ||
            !duration
        ) {
            return;
        }

        const rect =
            waveformRef.current.getBoundingClientRect();

        const x = Math.max(
            0,
            Math.min(
                rect.width,
                clientX - rect.left
            )
        );

        const percentage =
            rect.width > 0
                ? x / rect.width
                : 0;

        const newTime =
            percentage * duration;

        audioRef.current.currentTime =
            newTime;

        setCurrentTime(newTime);
    };

    const handleWaveformPointerDown = (event) => {
        event.preventDefault();

        event.currentTarget.setPointerCapture(
            event.pointerId
        );

        seekAudio(event.clientX);
    };

    const handleWaveformPointerMove = (event) => {
        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId
            )
        ) {
            seekAudio(event.clientX);
        }
    };

    const handleWaveformPointerUp = (event) => {
        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        }
    };

    /*
     * =========================
     * SEBESSÉG
     * =========================
     */

    const changePlaybackRate = () => {
        const rates = [
            1,
            1.25,
            1.5,
            2,
        ];

        const currentIndex =
            rates.indexOf(playbackRate);

        const nextRate =
            rates[
                (currentIndex + 1) %
                    rates.length
            ];

        setPlaybackRate(nextRate);

        if (audioRef.current) {
            audioRef.current.playbackRate =
                nextRate;
        }
    };

    /*
     * =========================
     * IDŐ
     * =========================
     */

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds)) {
            return "00:00";
        }

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            Math.floor(seconds % 60);

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    const progress =
        duration > 0
            ? Math.min(
                  1,
                  Math.max(
                      0,
                      currentTime / duration
                  )
              )
            : 0;

    return (
        <div className="voice-message">
            <button
                type="button"
                className="voice-message-play"
                onClick={togglePlayback}
                aria-label={
                    isPlaying
                        ? "Szünet"
                        : "Lejátszás"
                }
            >
                {isPlaying ? (
                    <BsPauseFill />
                ) : (
                    <BsPlayFill />
                )}
            </button>

            <div
                ref={waveformRef}
                className="voice-message-waveform"
                onPointerDown={
                    handleWaveformPointerDown
                }
                onPointerMove={
                    handleWaveformPointerMove
                }
                onPointerUp={
                    handleWaveformPointerUp
                }
                onPointerCancel={
                    handleWaveformPointerUp
                }
            >
                {waveform.map(
                    (value, index) => {
                        const barProgress =
                            progress *
                                waveform.length -
                            index;

                        const fill =
                            Math.max(
                                0,
                                Math.min(
                                    1,
                                    barProgress
                                )
                            );

                        const height =
                            Math.max(
                                5,
                                Math.min(
                                    30,
                                    value * 30
                                )
                            );

                        return (
                            <span
                                key={index}
                                className="voice-message-wave-bar"
                                style={{
                                    height: `${height}px`,
                                    background: `linear-gradient(
                                        to right,
                                        #8b5cf6 ${fill * 100}%,
                                        rgba(255, 255, 255, 0.30) ${fill * 100}%
                                    )`,
                                }}
                            />
                        );
                    }
                )}
            </div>

            <div className="voice-message-time">
                {formatTime(currentTime)}
                {" / "}
                {formatTime(duration)}
            </div>

            <button
                type="button"
                className="voice-message-speed"
                onClick={
                    changePlaybackRate
                }
                aria-label="Lejátszási sebesség"
            >
                {playbackRate}×
            </button>

            <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                onPlay={() =>
                    setIsPlaying(true)
                }
                onPause={() =>
                    setIsPlaying(false)
                }
                onTimeUpdate={
                    handleTimeUpdate
                }
                onLoadedMetadata={
                    handleLoadedMetadata
                }
                onEnded={handleEnded}
            />
        </div>
    );
}

export default VoiceMessage;