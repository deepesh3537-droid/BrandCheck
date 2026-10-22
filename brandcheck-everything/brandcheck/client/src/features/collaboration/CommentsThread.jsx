import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, User, Clock } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService.js';

export default function CommentsThread({ reviewId, findingId = null }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    if (!reviewId) return;
    try {
      setLoading(true);
      setError(null);
      const list = await collaborationService.getComments(reviewId);
      setComments(list || []);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await collaborationService.addComment(reviewId, {
        findingId,
        body: newComment.trim(),
      });
      setComments((prev) => [...prev, res.comment]);
      setNewComment('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter comments if findingId specified
  const filteredComments = findingId
    ? comments.filter((c) => c.finding_id === findingId)
    : comments;

  return (
    <div className="flex flex-col h-full bg-surface text-text select-none">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-text uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Discussion & Comments</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted">
          {filteredComments.length}
        </span>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading discussion...</span>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted space-y-1">
            <MessageSquare className="w-8 h-8 text-muted/30 mx-auto mb-2" />
            <p className="font-medium text-text">No comments yet</p>
            <p className="text-[11px]">Start a discussion or leave feedback for the author.</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-xl border border-border bg-surface-2 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-medium text-text">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{comment.author_name || comment.author_email || 'Teammate'}</span>
                </div>
                <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>
              <p className="text-xs text-text/90 leading-relaxed font-sans whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-surface-2/60 shrink-0 space-y-2">
        {error && (
          <div className="text-[11px] text-error bg-error/10 border border-error/30 p-1.5 rounded">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type a comment or question..."
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text placeholder-muted/60 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-bg font-semibold text-xs hover:bg-primary-hover shadow-glow-primary transition-colors disabled:opacity-40 shrink-0"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
