"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './Composer.module.css';
import { 
  MessageSquare,
  Image as ImageIcon,
  X,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Pencil,
  Wand2,
  Layers,
  Focus
} from 'lucide-react';
import { 
  FaInstagram, 
  FaTwitter, 
  FaLinkedin, 
  FaFacebook, 
  FaYoutube, 
  FaTiktok, 
  FaPinterest, 
  FaDiscord, 
  FaSlack 
} from 'react-icons/fa';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: FaInstagram },
  { id: 'twitter', name: 'Twitter/X', icon: FaTwitter },
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin },
  { id: 'facebook', name: 'Facebook', icon: FaFacebook },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube },
  { id: 'pinterest', name: 'Pinterest', icon: FaPinterest },
  { id: 'discord', name: 'Discord', icon: FaDiscord },
  { id: 'slack', name: 'Slack', icon: FaSlack },
];

function ComposeForm() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'twitter']);
  const [content, setContent] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2025-06-15');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [activePreviewTab, setActivePreviewTab] = useState('instagram');
  const [mediaFiles, setMediaFiles] = useState<string[]>([]); // URLs or paths to media
  const [isUploading, setIsUploading] = useState(false);
  const [editMediaIndex, setEditMediaIndex] = useState<number | null>(null);
  
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const dateParam = searchParams.get('date');
  const router = useRouter();

  useEffect(() => {
    if (dateParam) {
      setScheduleDate(dateParam);
      setIsScheduled(true);
    }
  }, [dateParam]);

  useEffect(() => {
    if (idParam) {
      const fetchPost = async () => {
        try {
          const res = await fetch(`/api/posts/${idParam}`);
          if (res.ok) {
            const data = await res.json();
            const post = data.post;
            setContent(post.content || '');
            setSelectedPlatforms(post.platformTargets || []);
            setMediaFiles(post.mediaUrls || []);
            if (post.scheduledAt) {
              setIsScheduled(true);
              const dateObj = new Date(post.scheduledAt);
              setScheduleDate(dateObj.toISOString().split('T')[0]);
              setScheduleTime(dateObj.toTimeString().split(' ')[0].substring(0, 5));
            }
          }
        } catch (err) {
          console.error("Failed to fetch post", err);
        }
      };
      fetchPost();
    }
  }, [idParam]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch('/api/social/accounts');
        if (res.ok) {
          const data = await res.json();
          setConnectedAccounts(data.accounts || []);
        }
      } catch (err) {
        console.error("Failed to fetch connected accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => {
      const isSelected = prev.includes(id);
      const newSelection = isSelected ? prev.filter(p => p !== id) : [...prev, id];
      
      // Auto-select a preview tab if the active one is removed
      if (isSelected && activePreviewTab === id && newSelection.length > 0) {
        setActivePreviewTab(newSelection[0]);
      } else if (!isSelected && prev.length === 0) {
        setActivePreviewTab(id);
      }
      return newSelection;
    });
  };

  const handleGenerateAI = () => {
    setShowAiModal(true);
  };

  const submitAiPrompt = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          platforms: selectedPlatforms.map(id => PLATFORMS.find(p => p.id === id)?.name || id)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setContent(prev => prev ? `${prev}\n\n${data.caption}` : data.caption);
        setShowAiModal(false);
        setAiPrompt('');
      } else {
        alert("Failed to generate caption.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating caption.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      alert("Please add some content or media to your post.");
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform.");
      return;
    }

    const isScheduling = isScheduled && scheduleDate !== '';
    let scheduledAt = null;
    
    if (isScheduling) {
      const dateTimeString = `${scheduleDate}T${scheduleTime}`;
      scheduledAt = new Date(dateTimeString).toISOString();
    }

    try {
      const isUpdating = !!idParam;
      const url = isUpdating ? `/api/posts/${idParam}` : "/api/posts";
      const method = isUpdating ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrls: mediaFiles,
          platformTargets: selectedPlatforms,
          status: isScheduling ? "scheduled" : "published", // we set to published if immediate, though actual publish needs inngest or sync. Draft if they just click Save Draft
          scheduledAt
        })
      });

      if (res.ok) {
        alert(isUpdating ? "Post updated successfully!" : (isScheduling ? "Post scheduled successfully!" : "Post published successfully!"));
        if (idParam || dateParam) {
          router.push('/calendar');
        } else {
          setContent('');
          setMediaFiles([]);
          setSelectedPlatforms([]);
          setScheduleDate('');
          setIsScheduled(false);
        }
      } else {
        alert("Failed to save post");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving post");
    }
  };

  const handleMediaClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate local preview
    const localUrl = URL.createObjectURL(file);
    setMediaFiles(prev => [...prev, localUrl]);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Replace local url with permanent ImageKit URL
        setMediaFiles(prev => prev.map(u => u === localUrl ? data.media.url : u));
      } else {
        console.error("Upload failed");
        setMediaFiles(prev => prev.filter(u => u !== localUrl));
      }
    } catch (err) {
      console.error("Upload error", err);
      setMediaFiles(prev => prev.filter(u => u !== localUrl));
    } finally {
      setIsUploading(false);
      // reset input so same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index]); // Prevent memory leaks
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const applyTransformation = (transformStr: string) => {
    if (editMediaIndex === null) return;
    
    setMediaFiles(prev => {
      const newFiles = [...prev];
      const urlStr = newFiles[editMediaIndex];
      
      if (urlStr.startsWith('blob:')) {
        alert("Please wait for upload to finish before applying AI transformations.");
        return newFiles;
      }
      
      try {
        const urlObj = new URL(urlStr);
        urlObj.searchParams.set('tr', transformStr);
        urlObj.searchParams.set('t', Date.now().toString()); // Cache buster
        newFiles[editMediaIndex] = urlObj.toString();
      } catch (e) {
        console.error("Invalid URL", e);
      }
      return newFiles;
    });
    // Removed setEditMediaIndex(null) so modal stays open to see changes
  };

  const activeAccount = Array.isArray(connectedAccounts) 
    ? connectedAccounts.find(acc => acc.platform === activePreviewTab)
    : undefined;

  return (
    <div className={styles.composer}>
      {/* LEFT PANEL */}
      <div className={styles.left}>
        
        <div className={styles.card}>
          <div className={styles.cardTitle}>Select Platforms</div>
          <div className={styles.platformGrid}>
            {PLATFORMS.map(platform => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <div 
                  key={platform.id} 
                  className={`${styles.platformChip} ${isSelected ? styles.selected : ''}`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div className={styles.dot}></div>
                  {platform.name}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Content</div>
          <textarea 
            className={styles.editorArea} 
            placeholder="What's on your mind? Write your post here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <div className={styles.editorToolbar}>
            <span className={styles.charCount}>{content.length} / 2,200 characters</span>
            <button className={styles.aiBtn} onClick={handleGenerateAI}>
              <Sparkles size={16} /> Generate with AI
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Media</div>
          
          <input 
            type="file" 
            accept="image/*,video/*" 
            style={{ display: 'none' }} 
            id="media-upload"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <div className={styles.mediaZone} onClick={handleMediaClick} style={{ opacity: isUploading ? 0.5 : 1 }}>
            <div className={styles.icon}>🖼️</div>
            <p>{isUploading ? "Uploading to ImageKit..." : "Drag & drop images or videos, or click to browse"}</p>
            <p style={{fontSize: '12px', marginTop: '4px', color: '#334155'}}>PNG, JPG, GIF, MP4 up to 500MB</p>
          </div>
          {mediaFiles.length > 0 && (
            <div className={styles.mediaPreviews}>
              {mediaFiles.map((file, i) => (
                <div key={i} className={styles.mediaThumb}>
                  <img src={file} alt="preview" />
                  <button className={styles.edit} onClick={(e) => { e.stopPropagation(); setEditMediaIndex(i); }} title="Edit Image"><Pencil size={10} /></button>
                  <button className={styles.remove} onClick={(e) => { e.stopPropagation(); handleRemoveMedia(i); }} title="Remove"><X size={10} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Schedule</div>
          <div className={styles.scheduleRow}>
            <div className={styles.scheduleToggle}>
              <button 
                className={`${styles.toggle} ${isScheduled ? styles.on : ''}`}
                onClick={() => setIsScheduled(!isScheduled)}
              >
                <div className={styles.toggleThumb}></div>
              </button>
              <span style={{fontSize: '14px', color: '#94a3b8'}}>Schedule for later</span>
            </div>
          </div>
          {isScheduled && (
            <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
              <input 
                type="date" 
                className={styles.dateInput} 
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
              <input 
                type="time" 
                className={styles.dateInput} 
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className={styles.actionRow}>
          <button className={styles.btnDraft}>Save Draft</button>
          <button className={styles.btnPublish} onClick={handlePublish}>
            {idParam ? 'Save Changes' : (isScheduled ? 'Schedule Post →' : 'Publish Now →')}
          </button>
        </div>

      </div>

      {/* RIGHT PANEL - PREVIEW */}
      <div className={styles.right}>
        <div className={styles.previewHeader}>
          <h3>Preview</h3>
        </div>
        {selectedPlatforms.length > 0 ? (
          <>
            <div className={styles.platformTabs}>
              {selectedPlatforms.map(platformId => {
                const platform = PLATFORMS.find(p => p.id === platformId);
                return (
                  <button 
                    key={platformId}
                    className={`${styles.platformTab} ${activePreviewTab === platformId ? styles.active : ''}`}
                    onClick={() => setActivePreviewTab(platformId)}
                  >
                    {platform?.name}
                  </button>
                );
              })}
            </div>
            <div className={styles.previewCard}>
              {activeAccount ? (
                <div className={styles.previewCardHeader}>
                  <div className={styles.previewAvatar}></div>
                  <div>
                    <div className={styles.previewUsername}>{activeAccount.platformAccountName}</div>
                    <div className={styles.previewHandle}>Connected</div>
                  </div>
                </div>
              ) : (
                <div className={styles.previewCardHeader} style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className={styles.previewAvatar} style={{ background: '#1e1e2e' }}></div>
                    <div>
                      <div className={styles.previewUsername}>Not Connected</div>
                      <div className={styles.previewHandle}>Account Required</div>
                    </div>
                  </div>
                  <a href={`/api/social/${activePreviewTab}/connect`} style={{fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: 600}}>Connect</a>
                </div>
              )}
              
              {mediaFiles.length > 0 ? (
                <div className={styles.previewImage}>
                   <img src={mediaFiles[0]} alt="Post media" />
                </div>
              ) : (
                <div className={styles.previewImage} style={{background: '#1e1e2e', padding: '40px', textAlign: 'center'}}>
                  No media attached
                </div>
              )}
              <div className={styles.previewCaption}>
                {content || "Your caption will appear here as you type..."}
              </div>
              <div className={styles.previewActions}>
                <div className={styles.previewAction}><Heart size={14} /> Like</div>
                <div className={styles.previewAction}><MessageCircle size={14} /> Comment</div>
                <div className={styles.previewAction}><Share2 size={14} /> Share</div>
              </div>
            </div>
          </>
        ) : (
          <div style={{color: '#64748b', fontSize: '14px', padding: '20px', textAlign: 'center', background: '#0f0f1a', borderRadius: '12px', border: '1px solid #1e1e2e'}}>
            Select a platform to see preview
          </div>
        )}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2><Sparkles size={18} color="#a855f7" /> Generate Post with AI</h2>
              <button className={styles.modalClose} onClick={() => setShowAiModal(false)}><X size={20} /></button>
            </div>
            <textarea 
              className={styles.modalInput} 
              placeholder="What do you want to post about? E.g., Announcing a new product launch..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowAiModal(false)}>Cancel</button>
              <button className={styles.btnGenerate} onClick={submitAiPrompt} disabled={isGenerating || !aiPrompt.trim()}>
                {isGenerating ? "Generating..." : "Generate Caption"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {editMediaIndex !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2><Wand2 size={18} color="#a855f7" /> AI Image Editor</h2>
              <button className={styles.modalClose} onClick={() => setEditMediaIndex(null)}><X size={20} /></button>
            </div>
            
            <img src={mediaFiles[editMediaIndex]} alt="Editing" className={styles.editorPreview} />
            
            <div className={styles.transformGrid}>
              <button className={styles.transformBtn} onClick={() => applyTransformation('e-bgremove')}>
                <Layers size={20} />
                Remove Background
              </button>
              <button className={styles.transformBtn} onClick={() => applyTransformation('fo-auto')}>
                <Focus size={20} />
                Smart Crop (Auto)
              </button>
              <button className={styles.transformBtn} onClick={() => applyTransformation('e-dropshadow')}>
                <ImageIcon size={20} />
                Add Drop Shadow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={<div style={{padding: '40px', color: '#fff'}}>Loading composer...</div>}>
      <ComposeForm />
    </Suspense>
  );
}
