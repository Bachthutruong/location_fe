import { useState, useEffect } from 'react'
import api from '../lib/api'
import { isAuthenticated, getUser } from '../lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
// import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Star, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Review {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  rating: number
  comment: string
  createdAt: string
}

interface ReviewListProps {
  locationId: string
}

const ReviewList: React.FC<ReviewListProps> = ({ locationId }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  })
  const user = getUser()
  const userReview = reviews.find((r) => r.user._id === user?.id)

  useEffect(() => {
    fetchReviews()
  }, [locationId])

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/location/${locationId}`)
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      toast.error('請先登入以進行評分')
      return
    }

    if (!reviewForm.comment.trim()) {
      toast.error('請輸入評論')
      return
    }

    try {
      await api.post('/reviews', {
        location: locationId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      })
      toast.success('已送出評價！')
      setReviewForm({ rating: 5, comment: '' })
      fetchReviews()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '送出評價時發生錯誤')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isAuthenticated() && !userReview && (
        <Card>
          <CardHeader>
            <CardTitle>撰寫評價</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>評分</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= reviewForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {reviewForm.rating}/5
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">評論</Label>
                <Textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="分享您的體驗..."
                  rows={4}
                />
              </div>
              <Button onClick={handleSubmitReview}>
                <Send className="h-4 w-4 mr-2" />
                送出評價
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          所有評價（{reviews.length}）
        </h3>
        {loading ? (
          <div className="text-center py-4">載入中...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            尚無任何評價
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{review.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewList



