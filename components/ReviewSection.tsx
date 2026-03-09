import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Star, Send, User } from 'lucide-react-native';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
  canReview: boolean;
}

function StarRating({ rating, size = 16, onPress }: { rating: number; size?: number; onPress?: (star: number) => void }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress?.(star)}
          disabled={!onPress}
        >
          <Star
            size={size}
            color="#FCD34D"
            fill={star <= rating ? '#FCD34D' : 'transparent'}
            style={{ marginRight: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={styles.reviewAvatar}>
            <User size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.reviewUserName}>{review.userName}</Text>
        </View>
        <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
      </View>
      <StarRating rating={review.rating} size={14} />
      {review.comment && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}
    </View>
  );
}

export default function ReviewSection({ reviews, averageRating, onSubmitReview, canReview }: ReviewSectionProps) {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (newRating === 0) {
      Alert.alert('Avaliação', 'Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitReview(newRating, newComment.trim());
      setNewRating(0);
      setNewComment('');
      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar sua avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Avaliações</Text>

      {/* Rating summary */}
      <View style={styles.ratingSummary}>
        <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
        <View>
          <StarRating rating={Math.round(averageRating)} />
          <Text style={styles.ratingCount}>{reviews.length} avaliações</Text>
        </View>
      </View>

      {/* Write review */}
      {canReview && (
        <View style={styles.writeReview}>
          <Text style={styles.writeTitle}>Deixe sua avaliação</Text>
          <StarRating rating={newRating} size={28} onPress={setNewRating} />
          <TextInput
            style={styles.commentInput}
            placeholder="Conte sobre sua experiência (opcional)"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Send size={16} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {submitting ? 'Enviando...' : 'Enviar avaliação'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma avaliação ainda. Seja o primeiro!</Text>
      ) : (
        reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ratingCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  writeReview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  writeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E11D48',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
