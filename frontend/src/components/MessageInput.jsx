import { useEffect, useRef, useState } from "react";
import {
    BsEmojiSmile,
    BsPaperclip,
    BsSoundwave,
    BsArrowUpShort,
    BsTrash,
    BsStopFill,
    BsFileEarmark,
    BsXLg,
    BsPlayFill,
    BsPauseFill,
} from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import "./MessageInput.css";

function MessageInput({
    message,
    setMessage,
    sendMessage,
    textareaRef,
    editingMessage,
    cancelEditingMessage,
    replyingTo,
    setReplyingTo,
    disabled = false,
}) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);

    const [playbackRate, setPlaybackRate] = useState(1);

    const [waveform, setWaveform] = useState([]);
    const [recordingWaveform, setRecordingWaveform] =
        useState([]);

    const emojiPickerRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const fileInputRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);

    const audioRef = useRef(null);
    const waveformRef = useRef(null);

    const recordingAudioContextRef = useRef(null);
    const recordingAnalyserRef = useRef(null);
    const recordingAnimationRef = useRef(null);
    const recordingStreamRef = useRef(null);

    const discardRecordingRef = useRef(false);

    /*
     * =========================
     * TEXTAREA
     * =========================
     */

    useEffect(() => {
        if (!textareaRef.current) {
            return;
        }

        textareaRef.current.style.height = "0px";

        textareaRef.current.style.height =
            textareaRef.current.scrollHeight + "px";
    }, [message, textareaRef]);

    const handleChange = (e) => {

        if (disabled) {
            return;
        }

        setMessage(e.target.value);
    };

    const cancelReplying = () => {

        setReplyingTo(null);

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    const handleKeyDown = async (e) => {

        if (disabled) {
            return;
        }


        if (e.key !== "Enter") {
            return;
        }


        const savedSetting =
            localStorage.getItem(
                "chatsphere_enter_to_send"
            );

        const enterToSend =
            savedSetting === null
                ? true
                : savedSetting === "true";


        const shouldSend =
            enterToSend
                ? !e.shiftKey
                : e.ctrlKey || e.metaKey;


        if (!shouldSend) {
            return;
        }


        e.preventDefault();


        const success =
            await sendMessage(selectedFiles);


        if (success) {

            setSelectedFiles([]);


            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (disabled) {
            return;
        }

        const success =
            await sendMessage(selectedFiles);

        if (success) {
            setSelectedFiles([]);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    /*
     * =========================
     * DRAG & DROP
     * =========================
     */

    const addDroppedFiles = (files) => {

        if (disabled) {
            return;
        }

        if (files.length === 0) {
            return;
        }

        setSelectedFiles((prev) => [
            ...prev,
            ...files,
        ]);

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.types.includes("Files")) {
            setIsDragging(true);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.types.includes("Files")) {
            e.dataTransfer.dropEffect = "copy";
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(false);

        const files =
            Array.from(e.dataTransfer.files);

        addDroppedFiles(files);
    };

    useEffect(() => {
        const preventDefaultFileDrop = (e) => {
            if (
                e.dataTransfer &&
                e.dataTransfer.types.includes("Files")
            ) {
                e.preventDefault();
            }
        };

        const handleGlobalDrop = (e) => {
            if (
                !e.dataTransfer ||
                !e.dataTransfer.types.includes("Files")
            ) {
                return;
            }

            e.preventDefault();

            const files =
                Array.from(e.dataTransfer.files);

            setIsDragging(false);

            addDroppedFiles(files);
        };

        window.addEventListener(
            "dragover",
            preventDefaultFileDrop
        );

        window.addEventListener(
            "drop",
            handleGlobalDrop
        );

        return () => {
            window.removeEventListener(
                "dragover",
                preventDefaultFileDrop
            );

            window.removeEventListener(
                "drop",
                handleGlobalDrop
            );
        };
    }, []);

    /*
     * =========================
     * HANGFELVÉTEL
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
        )}:${String(remainingSeconds).padStart(
            2,
            "0"
        )}`;
    };

    /*
     * =========================
     * ÉLŐ WAVEFORM
     * =========================
     */

    const stopRecordingVisualizer = () => {
        if (recordingAnimationRef.current) {
            cancelAnimationFrame(
                recordingAnimationRef.current
            );

            recordingAnimationRef.current = null;
        }

        if (recordingAudioContextRef.current) {
            recordingAudioContextRef.current
                .close()
                .catch(() => {});

            recordingAudioContextRef.current = null;
        }

        recordingAnalyserRef.current = null;

        setRecordingWaveform([]);
    };

    const startRecordingVisualizer = (stream) => {
        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            return;
        }

        try {
            const audioContext =
                new AudioContextClass();

            const analyser =
                audioContext.createAnalyser();

            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.82;

            const source =
                audioContext.createMediaStreamSource(
                    stream
                );

            source.connect(analyser);

            recordingAudioContextRef.current =
                audioContext;

            recordingAnalyserRef.current =
                analyser;

            const dataArray =
                new Uint8Array(
                    analyser.frequencyBinCount
                );

            const updateWaveform = () => {
                if (
                    !recordingAnalyserRef.current ||
                    discardRecordingRef.current
                ) {
                    return;
                }

                analyser.getByteFrequencyData(
                    dataArray
                );

                const barCount = 42;
                const bars = [];

                const usableBins =
                    Math.floor(
                        dataArray.length * 0.7
                    );

                const binsPerBar =
                    Math.max(
                        1,
                        Math.floor(
                            usableBins / barCount
                        )
                    );

                for (
                    let i = 0;
                    i < barCount;
                    i++
                ) {
                    const start =
                        i * binsPerBar;

                    const end = Math.min(
                        start + binsPerBar,
                        usableBins
                    );

                    let sum = 0;

                    for (
                        let j = start;
                        j < end;
                        j++
                    ) {
                        sum += dataArray[j];
                    }

                    const average =
                        end > start
                            ? sum /
                              (end - start)
                            : 0;

                    const normalized =
                        average / 255;

                    const height =
                        Math.max(
                            3,
                            Math.min(
                                32,
                                normalized * 65
                            )
                        );

                    bars.push(height);
                }

                setRecordingWaveform(bars);

                recordingAnimationRef.current =
                    requestAnimationFrame(
                        updateWaveform
                    );
            };

            if (
                audioContext.state === "suspended"
            ) {
                audioContext.resume();
            }

            updateWaveform();
        } catch (error) {
            console.error(
                "Élő waveform hiba:",
                error
            );
        }
    };

    const startRecording = async () => {
        try {
            if (
                !navigator.mediaDevices?.getUserMedia
            ) {
                alert(
                    "A böngésző nem támogatja a mikrofon használatát."
                );

                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        audio: true,
                    }
                );

            recordingStreamRef.current = stream;

            let mimeType = "";

            if (
                MediaRecorder.isTypeSupported(
                    "audio/webm;codecs=opus"
                )
            ) {
                mimeType =
                    "audio/webm;codecs=opus";
            } else if (
                MediaRecorder.isTypeSupported(
                    "audio/webm"
                )
            ) {
                mimeType = "audio/webm";
            }

            const recorder = mimeType
                ? new MediaRecorder(stream, {
                      mimeType,
                  })
                : new MediaRecorder(stream);

            mediaRecorderRef.current =
                recorder;

            audioChunksRef.current = [];

            discardRecordingRef.current = false;

            recorder.ondataavailable = (
                event
            ) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(
                        event.data
                    );
                }
            };

            recorder.onstop = () => {
                const shouldDiscard =
                    discardRecordingRef.current;

                stopRecordingVisualizer();

                if (recordingStreamRef.current) {
                    recordingStreamRef.current
                        .getTracks()
                        .forEach((track) =>
                            track.stop()
                        );

                    recordingStreamRef.current =
                        null;
                }

                if (shouldDiscard) {
                    audioChunksRef.current = [];
                    return;
                }

                const blob = new Blob(
                    audioChunksRef.current,
                    {
                        type:
                            recorder.mimeType ||
                            "audio/webm",
                    }
                );

                setAudioBlob(blob);

                const newUrl =
                    URL.createObjectURL(blob);

                setAudioUrl(newUrl);

                audioChunksRef.current = [];

                requestAnimationFrame(() => {
                    textareaRef.current?.focus();
                });
            };

            recorder.start();

            setRecordingTime(0);
            setIsRecording(true);

            setAudioBlob(null);
            setAudioUrl(null);

            setRecordingWaveform(
                Array.from(
                    { length: 42 },
                    () => 3
                )
            );

            startRecordingVisualizer(stream);

            recordingTimerRef.current =
                setInterval(() => {
                    setRecordingTime(
                        (prev) => prev + 1
                    );
                }, 1000);
        } catch (error) {
            console.error(
                "Mikrofon hiba:",
                error
            );

            alert(
                "A mikrofon nem érhető el. Ellenőrizd a böngésző mikrofonengedélyét."
            );
        }
    };

    const stopRecording = () => {
        const recorder =
            mediaRecorderRef.current;

        if (
            !recorder ||
            recorder.state === "inactive"
        ) {
            return;
        }

        discardRecordingRef.current = false;

        recorder.stop();

        setIsRecording(false);

        if (recordingTimerRef.current) {
            clearInterval(
                recordingTimerRef.current
            );

            recordingTimerRef.current = null;
        }

        stopRecordingVisualizer();
    };

    /*
     * =========================
     * FELVÉTEL AZONNALI ELDOBÁSA
     * =========================
     */

    const discardActiveRecording = () => {
        discardRecordingRef.current = true;

        const recorder =
            mediaRecorderRef.current;

        if (
            recorder &&
            recorder.state !== "inactive"
        ) {
            recorder.stop();
        }

        if (recordingTimerRef.current) {
            clearInterval(
                recordingTimerRef.current
            );

            recordingTimerRef.current = null;
        }

        stopRecordingVisualizer();

        if (recordingStreamRef.current) {
            recordingStreamRef.current
                .getTracks()
                .forEach((track) =>
                    track.stop()
                );

            recordingStreamRef.current = null;
        }

        mediaRecorderRef.current = null;

        audioChunksRef.current = [];

        setIsRecording(false);
        setRecordingTime(0);
        setRecordingWaveform([]);

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    /*
     * =========================
     * WAVEFORM GENERÁLÁS
     * =========================
     */

    useEffect(() => {
        if (!audioBlob) {
            setWaveform([]);
            return;
        }

        let cancelled = false;
        let audioContext = null;

        const generateWaveform = async () => {
            try {
                const arrayBuffer =
                    await audioBlob.arrayBuffer();

                const AudioContextClass =
                    window.AudioContext ||
                    window.webkitAudioContext;

                if (!AudioContextClass) {
                    return;
                }

                audioContext =
                    new AudioContextClass();

                const audioBuffer =
                    await audioContext.decodeAudioData(
                        arrayBuffer
                    );

                if (cancelled) {
                    return;
                }

                const channelData =
                    audioBuffer.getChannelData(0);

                const sampleCount = 180;

                const blockSize =
                    Math.floor(
                        channelData.length /
                            sampleCount
                    );

                const values = [];

                for (
                    let i = 0;
                    i < sampleCount;
                    i++
                ) {
                    const start =
                        i * blockSize;

                    const end =
                        Math.min(
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

                setAudioDuration(
                    audioBuffer.duration
                );
            } catch (error) {
                console.error(
                    "Waveform generálási hiba:",
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
    }, [audioBlob]);

    /*
     * =========================
     * AUDIO LEJÁTSZÁS
     * =========================
     */

    const toggleAudioPreview = () => {
        if (!audioRef.current) {
            return;
        }

        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    };

    const handleAudioTimeUpdate = () => {
        if (!audioRef.current) {
            return;
        }

        setAudioCurrentTime(
            audioRef.current.currentTime
        );
    };

    const handleAudioLoadedMetadata = () => {
        if (!audioRef.current) {
            return;
        }

        if (
            Number.isFinite(
                audioRef.current.duration
            )
        ) {
            setAudioDuration(
                audioRef.current.duration
            );
        }
    };

    /*
     * =========================
     * WAVEFORM SEEK
     * =========================
     */

    const seekAudio = (clientX) => {
        if (
            !waveformRef.current ||
            !audioRef.current ||
            !audioDuration
        ) {
            return;
        }

        const rect =
            waveformRef.current.getBoundingClientRect();

        if (rect.width <= 0) {
            return;
        }

        const x =
            clientX - rect.left;

        const percentage =
            Math.max(
                0,
                Math.min(
                    1,
                    x / rect.width
                )
            );

        const newTime =
            percentage * audioDuration;

        audioRef.current.currentTime =
            newTime;

        setAudioCurrentTime(newTime);
    };

    const handleWaveformPointerDown = (
        e
    ) => {
        e.preventDefault();

        e.currentTarget.setPointerCapture(
            e.pointerId
        );

        seekAudio(e.clientX);
    };

    const handleWaveformPointerMove = (
        e
    ) => {
        if (
            e.currentTarget.hasPointerCapture(
                e.pointerId
            )
        ) {
            seekAudio(e.clientX);
        }
    };

    const handleWaveformPointerUp = (e) => {
        if (
            e.currentTarget.hasPointerCapture(
                e.pointerId
            )
        ) {
            e.currentTarget.releasePointerCapture(
                e.pointerId
            );
        }
    };

    /*
     * =========================
     * LEJÁTSZÁSI SEBESSÉG
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
     * HANG TÖRLÉSE
     * =========================
     */

    const discardRecording = () => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !==
                "inactive"
        ) {
            discardRecordingRef.current = true;

            mediaRecorderRef.current.stop();
        }

        if (recordingTimerRef.current) {
            clearInterval(
                recordingTimerRef.current
            );

            recordingTimerRef.current = null;
        }

        stopRecordingVisualizer();

        if (recordingStreamRef.current) {
            recordingStreamRef.current
                .getTracks()
                .forEach((track) =>
                    track.stop()
                );

            recordingStreamRef.current = null;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setAudioBlob(null);
        setAudioUrl(null);

        setAudioCurrentTime(0);
        setAudioDuration(0);

        setRecordingTime(0);

        setIsRecording(false);
        setIsAudioPlaying(false);

        setPlaybackRate(1);
        setWaveform([]);
        setRecordingWaveform([]);

        audioChunksRef.current = [];

        mediaRecorderRef.current = null;

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    /*
     * =========================
     * HANGÜZENET KÜLDÉSE
     * =========================
     */

    const sendVoiceMessage = async () => {

        if (disabled) {
            return;
        }

        if (!audioBlob) {
            return;
        }

        const audioFile = new File(
            [audioBlob],
            `voice-message-${Date.now()}.webm`,
            {
                type:
                    audioBlob.type ||
                    "audio/webm",
            }
        );

        const success =
            await sendMessage([
                ...selectedFiles,
                audioFile,
            ]);

        if (!success) {
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setAudioBlob(null);
        setAudioUrl(null);

        setAudioCurrentTime(0);
        setAudioDuration(0);

        setRecordingTime(0);

        setIsAudioPlaying(false);

        setPlaybackRate(1);

        setWaveform([]);

        setSelectedFiles([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    /*
     * =========================
     * CLEANUP
     * =========================
     */

    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(
                    recordingTimerRef.current
                );
            }

            if (recordingAnimationRef.current) {
                cancelAnimationFrame(
                    recordingAnimationRef.current
                );
            }

            if (recordingAudioContextRef.current) {
                recordingAudioContextRef.current
                    .close()
                    .catch(() => {});
            }

            if (recordingStreamRef.current) {
                recordingStreamRef.current
                    .getTracks()
                    .forEach((track) =>
                        track.stop()
                    );
            }

            if (audioRef.current) {
                audioRef.current.pause();
            }

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    /*
     * =========================
     * EMOJI
     * =========================
     */

    useEffect(() => {
        const handleClickOutside = (
            event
        ) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(
                    event.target
                ) &&
                emojiButtonRef.current &&
                !emojiButtonRef.current.contains(
                    event.target
                )
            ) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    useEffect(() => {

        const handleEscape = (event) => {

            if (event.key !== "Escape") {
                return;
            }

            if (showEmojiPicker) {

                setShowEmojiPicker(false);

                requestAnimationFrame(() => {
                    textareaRef.current?.focus();
                });

                return;
            }

            if (editingMessage) {

                cancelEditingMessage();

            }

        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {

            window.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [
        showEmojiPicker,
        editingMessage,
        cancelEditingMessage,
        textareaRef,
    ]);

    const expanded =
        message.split("\n").length > 1 ||
        (textareaRef.current &&
            textareaRef.current.scrollHeight >
                42);

    /*
     * =========================
     * RENDER
     * =========================
     */

    return (
        <div
            className={
                isDragging
                    ? "message-input-wrapper dragging"
                    : "message-input-wrapper"
            }
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && !disabled && (
                <div className="drag-drop-overlay">
                    <div className="drag-drop-content">
                        <BsPaperclip />

                        <span>
                            Fájlok feltöltése
                        </span>

                        <small>
                            Engedd el a fájlokat itt
                        </small>
                    </div>
                </div>
            )}

            {selectedFiles.length > 0 && (
                <div className="file-preview-list">
                    {selectedFiles.map(
                        (file, index) => (
                            <div
                                key={index}
                                className="file-preview-content"
                            >
                                {file.type.startsWith(
                                    "image/"
                                ) ? (
                                    <img
                                        src={URL.createObjectURL(
                                            file
                                        )}
                                        alt={file.name}
                                        className="preview-image"
                                    />
                                ) : (
                                    <div className="preview-file-icon">
                                        <BsFileEarmark />
                                    </div>
                                )}

                                <div className="preview-info">
                                    <strong>
                                        {file.name}
                                    </strong>

                                    <small>
                                        {(
                                            file.size /
                                            1024
                                        ).toFixed(
                                            1
                                        )}{" "}
                                        KB
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="remove-file-btn"
                                    onClick={() => {
                                        const updated =
                                            selectedFiles.filter(
                                                (_, i) =>
                                                    i !==
                                                    index
                                            );

                                        setSelectedFiles(
                                            updated
                                        );

                                        if (
                                            updated.length ===
                                                0 &&
                                            fileInputRef.current
                                        ) {
                                            fileInputRef.current.value =
                                                "";
                                        }
                                    }}
                                >
                                    <BsXLg />
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* ========================= */}
            {/* FELVÉTEL */}
            {/* ========================= */}

            {isRecording && (
                <div className="voice-message-container">
                    <div className="voice-recording-preview">
                        <span
                            className="voice-recording-dot"
                            aria-hidden="true"
                        />

                        <span className="voice-recording-time">
                            {formatTime(
                                recordingTime
                            )}
                        </span>

                        <span className="voice-recording-label">
                            Felvétel...
                        </span>

                        <div className="voice-recording-wave">
                            {recordingWaveform.map(
                                (
                                    height,
                                    index
                                ) => (
                                    <span
                                        key={index}
                                        className="recording-wave-bar"
                                        style={{
                                            height: `${height}px`,
                                            animation:
                                                "none",
                                        }}
                                    />
                                )
                            )}
                        </div>

                        <button
                            type="button"
                            className="voice-recording-delete"
                            onClick={
                                discardActiveRecording
                            }
                            aria-label="Felvétel eldobása"
                        >
                            <BsTrash />
                        </button>
                    </div>
                </div>
            )}

            {/* ========================= */}
            {/* HANG ELŐNÉZET */}
            {/* ========================= */}

            {!isRecording && audioBlob && (
                <div className="voice-message-container">
                    <div className="voice-message-preview">
                        <button
                            type="button"
                            className="voice-preview-play"
                            onClick={
                                toggleAudioPreview
                            }
                            aria-label={
                                isAudioPlaying
                                    ? "Szünet"
                                    : "Lejátszás"
                            }
                        >
                            {isAudioPlaying ? (
                                <BsPauseFill />
                            ) : (
                                <BsPlayFill />
                            )}
                        </button>

                        <div
                            ref={waveformRef}
                            className="voice-preview-waveform"
                            onPointerDown={handleWaveformPointerDown}
                            onPointerMove={handleWaveformPointerMove}
                            onPointerUp={handleWaveformPointerUp}
                            onPointerCancel={handleWaveformPointerUp}
                        >
                            {waveform.map((value, index) => {
                                const progress =
                                    audioDuration > 0
                                        ? audioCurrentTime / audioDuration
                                        : 0;

                                const barProgress =
                                    progress * waveform.length - index;

                                const fill = Math.max(
                                    0,
                                    Math.min(1, barProgress)
                                );

                                const height = Math.max(
                                    5,
                                    Math.min(
                                        30,
                                        value * 34
                                    )
                                );

                                return (
                                    <span
                                        key={index}
                                        className="voice-wave-bar"
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
                            })}
                        </div>

                        <div className="voice-preview-time">
                            {formatTime(
                                audioCurrentTime
                            )}
                            {" / "}
                            {formatTime(
                                audioDuration
                            )}
                        </div>

                        <button
                            type="button"
                            className="voice-preview-speed"
                            onClick={
                                changePlaybackRate
                            }
                            aria-label="Lejátszási sebesség"
                        >
                            {playbackRate}x
                        </button>

                        <button
                            type="button"
                            className="voice-preview-delete"
                            onClick={
                                discardRecording
                            }
                            aria-label="Hangfelvétel törlése"
                        >
                            <BsXLg />
                        </button>

                        <audio
                            ref={audioRef}
                            src={audioUrl || ""}
                            onPlay={() =>
                                setIsAudioPlaying(
                                    true
                                )
                            }
                            onPause={() =>
                                setIsAudioPlaying(
                                    false
                                )
                            }
                            onEnded={() => {
                                setIsAudioPlaying(
                                    false
                                );

                                setAudioCurrentTime(
                                    0
                                );
                            }}
                            onTimeUpdate={
                                handleAudioTimeUpdate
                            }
                            onLoadedMetadata={
                                handleAudioLoadedMetadata
                            }
                            style={{
                                display: "none",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ========================= */}
            {/* SZÖVEGES ÜZENET */}
            {/* ========================= */}

            {editingMessage && (

                <div className="message-edit-banner">

                    <div className="message-edit-banner-content">

                        <span className="message-edit-banner-title">
                            Üzenet szerkesztése
                        </span>

                        <span className="message-edit-banner-preview">
                            {editingMessage.content}
                        </span>

                    </div>

                    <button
                        type="button"
                        className="message-edit-banner-close"
                        onClick={cancelEditingMessage}
                        aria-label="Szerkesztés megszakítása"
                        title="Szerkesztés megszakítása"
                    >
                        <BsXLg />
                    </button>

                </div>

            )}

            {replyingTo && !editingMessage && (

                <div className="message-reply-banner">

                    <div className="message-reply-banner-content">

                        <span className="message-reply-banner-title">
                            Válasz neki: {replyingTo.username}
                        </span>

                        <span className="message-reply-banner-preview">
                            {replyingTo.content || "Csatolmány"}
                        </span>

                    </div>

                    <button
                        type="button"
                        className="message-reply-banner-close"
                        onClick={cancelReplying}
                        aria-label="Válasz megszakítása"
                        title="Válasz megszakítása"
                    >
                        <BsXLg />
                    </button>

                </div>

            )}

            <form
                className="message-container"
                onSubmit={handleSubmit}
            >
                <div className="message-actions-left">
                    <button
                        ref={emojiButtonRef}
                        type="button"
                        className="glass-btn"
                        onClick={() =>
                            setShowEmojiPicker(
                                (prev) => !prev
                            )
                        }
                        disabled={disabled}
                    >
                        <BsEmojiSmile />
                    </button>

                    {showEmojiPicker && (
                        <div
                            className="emoji-picker-wrapper"
                            ref={emojiPickerRef}
                        >
                            <EmojiPicker
                                theme={
                                    document.documentElement.getAttribute(
                                        "data-theme"
                                    ) === "light"
                                        ? "light"
                                        : "dark"
                                }
                                width={320}
                                height={420}
                                onEmojiClick={(
                                    emojiData
                                ) => {
                                    const textarea =
                                        textareaRef.current;

                                    if (!textarea) {
                                        return;
                                    }

                                    const start =
                                        textarea.selectionStart;

                                    const end =
                                        textarea.selectionEnd;

                                    const newMessage =
                                        message.substring(
                                            0,
                                            start
                                        ) +
                                        emojiData.emoji +
                                        message.substring(
                                            end
                                        );

                                    setMessage(
                                        newMessage
                                    );

                                    setShowEmojiPicker(
                                        false
                                    );

                                    requestAnimationFrame(
                                        () => {
                                            textarea.focus();

                                            const newPosition =
                                                start +
                                                emojiData
                                                    .emoji
                                                    .length;

                                            textarea.setSelectionRange(
                                                newPosition,
                                                newPosition
                                            );
                                        }
                                    );
                                }}
                            />
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        hidden
                        disabled={disabled}
                        onChange={(e) => {
                            const files =
                                Array.from(
                                    e.target.files
                                );

                            if (
                                files.length ===
                                0
                            ) {
                                return;
                            }

                            setSelectedFiles(
                                (prev) => [
                                    ...prev,
                                    ...files,
                                ]
                            );

                            requestAnimationFrame(
                                () => {
                                    textareaRef.current?.focus();
                                }
                            );
                        }}
                    />

                    <button
                        type="button"
                        className="glass-btn"
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                        disabled={disabled}
                    >
                        <BsPaperclip />
                    </button>
                </div>

                <div
                    className={
                        expanded
                            ? "message-editor expanded"
                            : "message-editor"
                    }
                >
                    <textarea
                        ref={textareaRef}
                        className="message-textarea"
                        placeholder={
                            disabled
                                ? "Válassz egy csatornát..."
                                : "Írj üzenetet..."
                        }
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={disabled}
                    />
                </div>

                <div className="message-actions-right">
                    {isRecording ? (
                        <button
                            type="button"
                            className="glass-btn recording-stop-button"
                            onClick={
                                stopRecording
                            }
                            aria-label="Felvétel leállítása"
                            disabled={disabled}
                        >
                            <BsStopFill />
                        </button>
                    ) : audioBlob ? (
                        <button
                            type="button"
                            className="glass-btn voice-send-button"
                            onClick={
                                sendVoiceMessage
                            }
                            aria-label="Hangüzenet küldése"
                            disabled={disabled}
                        >
                            <BsArrowUpShort />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="glass-btn"
                            onClick={
                                startRecording
                            }
                            aria-label="Hangfelvétel indítása"
                            disabled={disabled}
                        >
                            <BsSoundwave />
                        </button>
                    )}

                    {!isRecording &&
                        !audioBlob && (
                            <button
                                type="submit"
                                className="glass-btn"
                                aria-label="Üzenet küldése"
                                disabled={disabled}
                            >
                                <BsArrowUpShort />
                            </button>
                        )}
                </div>
            </form>
        </div>
    );
}

export default MessageInput;