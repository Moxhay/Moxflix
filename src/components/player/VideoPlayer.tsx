'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import ReactPlayer from 'react-player';
import VideoPlayerHeader from './VideoPlayerHeader';
import VideoPlayerCenterControls from './VideoPlayerCenterControls';
import VideoPlayerControls from './VideoPlayerControls';
import VideoPlayerError from './VideoPlayerError';
import VideoPlayerEpisodeSelector from './VideoPlayerEpisodeSelector';
import { apiProgress } from '@/api/api';
import { useAuth } from '@/providers/AuthProvider';

interface SeriesNavigation {
    seriesId: number;
    seriesTitle: string;
    currentEpisodeId: number;
    currentSeasonNumber: number;
    seasons: {
        id: number;
        number: number;
        name: string;
        episodes: {
            id: number;
            title: string;
            episodeNumber: number;
            duration: number | null;
        }[];
    }[];
}

interface VideoPlayerProps {
    src: string;
    title: string;
    subtitle?: string;
    poster?: string;
    seriesNavigation?: SeriesNavigation;
    mediaType: 'movie' | 'episode';
    mediaId: number;
}

export default function VideoPlayer({ src, title, subtitle, poster, seriesNavigation, mediaType, mediaId }: VideoPlayerProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastSavedTime = useRef<number>(0);
    const initialSeekDone = useRef<boolean>(false);
    const isAuthenticated = useRef<boolean>(false);

    useEffect(() => {
        isAuthenticated.current = !!user;
    }, [user]);

    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(100);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
    const [initialProgress, setInitialProgress] = useState<number | null>(null);

    const formatTime = useCallback((seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const saveProgress = useCallback(async (time: number, dur: number) => {
        if (!user) return;
        if (dur <= 0 || time <= 0) return;
        if (Math.abs(time - lastSavedTime.current) < 5) return;

        lastSavedTime.current = time;
        const progressPercent = Math.round((time / dur) * 100);

        try {
            await apiProgress.save({
                mediaType,
                mediaId,
                timestamp: Math.floor(time),
                duration: Math.floor(dur)
            });

            type ProgressItem = { movieId: number | null; episodeId: number | null; progress: number };
            queryClient.setQueryData<ProgressItem[]>(
                ['allProgressRaw', user.id],
                (old) => {
                    if (!old) {
                        return [{
                            movieId: mediaType === 'movie' ? mediaId : null,
                            episodeId: mediaType === 'episode' ? mediaId : null,
                            progress: progressPercent
                        }];
                    }

                    const key = mediaType === 'movie' ? 'movieId' : 'episodeId';
                    const existingIndex = old.findIndex(item => item[key] === mediaId);

                    if (existingIndex >= 0) {
                        const updated = [...old];
                        updated[existingIndex] = { ...updated[existingIndex], progress: progressPercent };
                        return updated;
                    }

                    return [...old, {
                        movieId: mediaType === 'movie' ? mediaId : null,
                        episodeId: mediaType === 'episode' ? mediaId : null,
                        progress: progressPercent
                    }];
                }
            );
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }, [mediaType, mediaId, user, queryClient]);

    useEffect(() => {
        if (!user) return;

        const fetchProgress = async () => {
            try {
                const res = await apiProgress.getForMedia(mediaType, mediaId, { cache: false });
                if (res.success && res.data) {
                    const data = res.data as { data: { timestamp: number; duration: number; completed: boolean } | null };
                    if (data.data && !data.data.completed && data.data.timestamp > 10) {
                        setInitialProgress(data.data.timestamp);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch progress:', e);
            }
        };
        fetchProgress();
    }, [mediaType, mediaId, user]);

    useEffect(() => {
        if (initialProgress && duration > 0 && !initialSeekDone.current) {
            const api = playerRef.current?.api;
            if (api && typeof api.seekTo === 'function') {
                api.seekTo(initialProgress, true);
                initialSeekDone.current = true;
            }
        }
    }, [initialProgress, duration]);

    useEffect(() => {
        if (!playing || duration <= 0) return;

        const interval = setInterval(() => {
            saveProgress(currentTime, duration);
        }, 10000);

        return () => clearInterval(interval);
    }, [playing, currentTime, duration, saveProgress]);

    const handlePause = useCallback(() => {
        setPlaying(false);
        if (duration > 0 && currentTime > 0) {
            saveProgress(currentTime, duration);
        }
    }, [currentTime, duration, saveProgress]);

    useEffect(() => {
        return () => {
            if (!isAuthenticated.current) return;
            if (duration > 0 && currentTime > 0) {
                apiProgress.save({
                    mediaType,
                    mediaId,
                    timestamp: Math.floor(currentTime),
                    duration: Math.floor(duration)
                }).catch(() => {});
            }
        };
    }, [mediaType, mediaId, currentTime, duration]);

    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        if (playing && !isHovering && !showEpisodeSelector) {
            hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [playing, isHovering, showEpisodeSelector]);

    const handleMouseMove = useCallback(() => {
        resetHideTimer();
    }, [resetHideTimer]);

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true);
        setShowControls(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
        if (playing && !showEpisodeSelector) {
            hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 2000);
        }
    }, [playing, showEpisodeSelector]);

    const handleError = useCallback(() => {
        setError('This video is unavailable. It may be blocked in your region.');
    }, []);

    const handlePlayPause = useCallback(() => {
        setPlaying((prev) => !prev);
    }, []);

    const handleSeek = useCallback(
        (percent: number) => {
            const api = playerRef.current?.api;
            if (!api || duration === 0) return;
            const time = (percent / 100) * duration;
            if (typeof api.seekTo === 'function') {
                api.seekTo(time, true);
            }
        },
        [duration]
    );

    const handleSkip = useCallback(
        (seconds: number) => {
            const api = playerRef.current?.api;
            if (!api || !duration) return;
            const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
            if (typeof api.seekTo === 'function') {
                api.seekTo(newTime, true);
            }
        },
        [duration, currentTime]
    );

    const handleVolumeChange = useCallback((newVolume: number) => {
        setVolume(newVolume * 100);
        setMuted(newVolume === 0);
    }, []);

    const handleToggleMute = useCallback(() => {
        setMuted((prev) => !prev);
    }, []);

    const handleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!isFullscreen) {
            containerRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }, [isFullscreen]);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleToggleEpisodeSelector = useCallback(() => {
        setShowEpisodeSelector((prev) => !prev);
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (showEpisodeSelector && e.key === 'Escape') {
                e.preventDefault();
                setShowEpisodeSelector(false);
                return;
            }

            resetHideTimer();
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handleSkip(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleSkip(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleVolumeChange(Math.min(1, volume / 100 + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleVolumeChange(Math.max(0, volume / 100 - 0.1));
                    break;
                case 'm':
                    e.preventDefault();
                    handleToggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    handleFullscreen();
                    break;
                case 'e':
                    if (seriesNavigation) {
                        e.preventDefault();
                        handleToggleEpisodeSelector();
                    }
                    break;
                case 'Escape':
                    if (!isFullscreen) {
                        handleBack();
                    }
                    break;
            }
        },
        [
            showEpisodeSelector,
            resetHideTimer,
            handlePlayPause,
            handleSkip,
            handleVolumeChange,
            handleToggleMute,
            handleFullscreen,
            handleToggleEpisodeSelector,
            handleBack,
            volume,
            isFullscreen,
            seriesNavigation
        ]
    );

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const api = playerRef.current?.api;
            if (api && typeof api.getDuration === 'function') {
                const dur = api.getDuration() || 0;
                const time = api.getCurrentTime() || 0;
                if (dur > 0) {
                    setDuration(dur);
                    setCurrentTime(time);
                    setProgress((time / dur) * 100);
                }
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (playing && !isHovering && !showEpisodeSelector) {
            hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        } else {
            setShowControls(true);
        }
        return () => {
            if (hideControlsTimeout.current) {
                clearTimeout(hideControlsTimeout.current);
            }
        };
    }, [playing, isHovering, showEpisodeSelector]);

    if (!src) {
        return <VideoPlayerError message="No video available for this content." poster={poster} title={title} onBack={handleBack} />;
    }

    if (error) {
        return <VideoPlayerError message={error} poster={poster} title={title} onBack={handleBack} />;
    }

    return (
        <div
            ref={containerRef}
            className="group relative h-full w-full bg-[#0a0a0a] outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="application"
            aria-label={`Video player: ${title}`}
        >
            <ReactPlayer
                ref={playerRef}
                src={src}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume / 100}
                muted={muted}
                onReady={() => {}}
                onError={handleError}
                onPlay={() => setPlaying(true)}
                onPause={handlePause}
                onEnded={() => setPlaying(false)}
                config={
                    {
                        youtube: {
                            playerVars: {
                                modestbranding: 1,
                                rel: 0,
                                controls: 0,
                                disablekb: 1,
                                iv_load_policy: 3,
                                fs: 0,
                                showinfo: 0,
                                cc_load_policy: 0,
                                playsinline: 1
                            }
                        }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                }
            />

            <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            >
                <VideoPlayerHeader title={title} subtitle={subtitle} onBack={handleBack} />

                <VideoPlayerCenterControls playing={playing} onPlayPause={handlePlayPause} onSkip={handleSkip} />

                <VideoPlayerControls
                    playing={playing}
                    progress={progress}
                    currentTime={currentTime}
                    duration={duration}
                    volume={volume}
                    muted={muted}
                    isFullscreen={isFullscreen}
                    onPlayPause={handlePlayPause}
                    onSeek={handleSeek}
                    onVolumeChange={handleVolumeChange}
                    onToggleMute={handleToggleMute}
                    onFullscreen={handleFullscreen}
                    formatTime={formatTime}
                    showEpisodesButton={!!seriesNavigation}
                    onToggleEpisodes={handleToggleEpisodeSelector}
                />
            </div>

            {seriesNavigation && (
                <VideoPlayerEpisodeSelector
                    seriesId={seriesNavigation.seriesId}
                    seriesTitle={seriesNavigation.seriesTitle}
                    seasons={seriesNavigation.seasons}
                    currentEpisodeId={seriesNavigation.currentEpisodeId}
                    currentSeasonNumber={seriesNavigation.currentSeasonNumber}
                    isOpen={showEpisodeSelector}
                    onClose={() => setShowEpisodeSelector(false)}
                />
            )}
        </div>
    );
}
