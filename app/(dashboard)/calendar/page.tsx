"use client";

import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarGrid } from '@/components/social/CalendarGrid';
import { PostDetailPanel } from '@/components/social/PostDetailPanel';
import styles from './Calendar.module.css';
import Link from 'next/link';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const fetchPosts = async (date: Date) => {
    // Determine the range of days visible on the calendar
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    try {
      const res = await fetch(`/api/posts?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  useEffect(() => {
    fetchPosts(currentDate);
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
        setSelectedPost(null);
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting post');
    }
  };

  return (
    <>
      <div className={styles.calendarHeader}>
        <h1>Content Calendar</h1>
        <div className={styles.calControls}>
          <div className={styles.monthNav}>
            <button className={styles.navBtn} onClick={handlePrevMonth}>‹</button>
            <div className={styles.monthLabel}>{format(currentDate, 'MMMM yyyy')}</div>
            <button className={styles.navBtn} onClick={handleNextMonth}>›</button>
          </div>
          <div className={styles.viewTabs}>
            <div className={`${styles.viewTab} ${styles.active}`}>Month</div>
            <div className={styles.viewTab}>Week</div>
            <div className={styles.viewTab}>Day</div>
          </div>
          <Link href="/compose" className={styles.newPostBtn}>+ New Post</Link>
        </div>
      </div>

      <CalendarGrid 
        currentDate={currentDate} 
        posts={posts} 
        onPostClick={setSelectedPost} 
      />

      <PostDetailPanel 
        post={selectedPost} 
        onClose={() => setSelectedPost(null)} 
        onDelete={handleDelete} 
      />
    </>
  );
}
