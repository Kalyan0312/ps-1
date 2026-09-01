import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare } from 'lucide-react';
import { submitRating } from '@/services/community';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  workerName: string;
  direction: 'customer_to_worker' | 'worker_to_customer';
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  workerName,
  direction
}) => {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCustomerRating = direction === 'customer_to_worker';
  const title = isCustomerRating ? `Rate ${workerName}` : 'Rate this Customer';
  const subtitle = isCustomerRating
    ? 'Your feedback helps the cooperative community'
    : 'Anonymous rating — your identity is not shown';

  const handleSubmit = async () => {
    if (stars === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitRating({
        booking_id: bookingId,
        direction,
        stars,
        comment: comment.trim() || undefined
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset state after close
        setStars(0);
        setComment('');
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  const activeStars = hoverStars || stars;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#171717]/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] relative bg-[#FFFFFF] border border-[#E0D5C8] text-[#171717]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E0D5C8] bg-[#F7F3EC] rounded-t-3xl">
          <div>
            <h2 className="font-extrabold text-lg tracking-tight text-[#171717] font-display">
              {title}
            </h2>
            <p className="text-xs font-medium text-[#6F6A63]">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EFE2D2] text-[#6F6A63] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-[#527A62]/10 text-[#527A62] border border-[#527A62]/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#171717] font-display">
                  Rating Submitted!
                </h3>
                <p className="text-sm mt-1 text-[#6F6A63]">
                  Thank you for your feedback
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Star Rating */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStars(s)}
                      onMouseEnter={() => setHoverStars(s)}
                      onMouseLeave={() => setHoverStars(0)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          s <= activeStars
                            ? 'text-[#9A5B3A] fill-[#9A5B3A]'
                            : 'text-[#E0D5C8]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {activeStars > 0 && (
                  <p className="text-sm font-bold text-[#9A5B3A] font-display">
                    {starLabels[activeStars]}
                  </p>
                )}
              </div>

              {/* Optional Comment */}
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-1.5 text-[#6F6A63]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#9A5B3A]" />
                  <span>Comment (optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 bg-[#F7F3EC] border border-[#E0D5C8] text-[#171717] placeholder-[#6F6A63] focus:border-[#9A5B3A] focus:ring-[#9A5B3A]/20"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl text-xs font-semibold bg-[#A94A43]/10 text-[#A94A43] border border-[#A94A43]/20">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={stars === 0 || submitting}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 active:scale-[0.98] bg-[#9A5B3A] hover:bg-[#C9684A] text-white shadow-lg shadow-[#9A5B3A]/20"
              >
                {submitting ? 'Submitting...' : `Submit ${stars > 0 ? `${stars}-Star` : ''} Rating`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
