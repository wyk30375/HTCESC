import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { feedbackApi, getCurrentDealershipId } from '@/db/api';
import type { Feedback } from '@/types/types';
import { toast } from 'sonner';
import { MessageSquare, Send, Bell, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeedbackCenter() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [newFeedback, setNewFeedback] = useState({ title: '', content: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentDealershipId, setCurrentDealershipId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbackData, dealershipId] = await Promise.all([
        feedbackApi.getAll(),
        getCurrentDealershipId(),
      ]);
      setFeedbacks(feedbackData);
      setCurrentDealershipId(dealershipId);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async () => {
    if (!newFeedback.title.trim() || !newFeedback.content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }

    try {
      setSubmitting(true);
      await feedbackApi.create({
        dealership_id: currentDealershipId,
        sender_type: 'dealership',
        message_type: 'feedback',
        title: newFeedback.title,
        content: newFeedback.content,
      });
      toast.success('反馈已提交');
      setNewFeedback({ title: '', content: '' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('提交反馈失败:', error);
      toast.error('提交反馈失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!selectedFeedback || !replyContent.trim()) {
      toast.error('请填写回复内容');
      return;
    }

    try {
      setSubmitting(true);
      await feedbackApi.create({
        dealership_id: currentDealershipId,
        sender_type: 'dealership',
        message_type: 'reply',
        title: `回复: ${selectedFeedback.title}`,
        content: replyContent,
        parent_id: selectedFeedback.id,
      });
      toast.success('回复已发送');
      setReplyContent('');
      loadData();
      // 重新加载详情
      const updated = await feedbackApi.getById(selectedFeedback.id);
      if (updated) setSelectedFeedback(updated);
    } catch (error) {
      console.error('发送回复失败:', error);
      toast.error('发送回复失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = async (feedback: Feedback) => {
    try {
      const detail = await feedbackApi.getById(feedback.id);
      if (detail) {
        setSelectedFeedback(detail);
        setDetailDialogOpen(true);
        // 如果是未读的平台消息，标记为已读
        if (detail.status === 'unread' && detail.sender_type === 'platform') {
          await feedbackApi.markAsRead(detail.id);
          loadData();
        }
      }
    } catch (error) {
      console.error('加载详情失败:', error);
      toast.error('加载详情失败');
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'feedback': return '反馈建议';
      case 'reminder': return '平台提醒';
      case 'reply': return '回复';
      default: return type;
    }
  };

  const getMessageTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'feedback': return 'default';
      case 'reminder': return 'destructive';
      case 'reply': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <PageWrapper title="反馈中心" description="与平台沟通交流">
        <div className="space-y-4">
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="反馈中心" description="与平台沟通交流">
      <div className="space-y-6">
        {/* 操作栏 */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-base py-1 px-3">
              <MessageSquare className="h-4 w-4 mr-1" />
              共 {feedbacks.length} 条消息
            </Badge>
            <Badge variant="destructive" className="text-base py-1 px-3">
              <Bell className="h-4 w-4 mr-1" />
              {feedbacks.filter(f => f.status === 'unread' && f.sender_type === 'platform').length} 条未读
            </Badge>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                提交反馈
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>提交反馈建议</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    placeholder="请输入反馈标题"
                    value={newFeedback.title}
                    onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">内容</Label>
                  <Textarea
                    id="content"
                    placeholder="请详细描述您的反馈或建议..."
                    rows={8}
                    value={newFeedback.content}
                    onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreateFeedback} disabled={submitting}>
                    <Send className="h-4 w-4 mr-2" />
                    提交
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 消息列表 */}
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无消息记录</p>
                <p className="text-sm mt-2">点击"提交反馈"向平台发送建议</p>
              </CardContent>
            </Card>
          ) : (
            feedbacks.map((feedback) => (
              <Card
                key={feedback.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  feedback.status === 'unread' && feedback.sender_type === 'platform'
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => handleViewDetail(feedback)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getMessageTypeVariant(feedback.message_type)}>
                          {getMessageTypeLabel(feedback.message_type)}
                        </Badge>
                        {feedback.sender_type === 'platform' && (
                          <Badge variant="outline">平台消息</Badge>
                        )}
                        {feedback.status === 'unread' && feedback.sender_type === 'platform' && (
                          <Badge variant="destructive">未读</Badge>
                        )}
                        {feedback.status === 'read' && (
                          <Badge variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            已读
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{feedback.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(feedback.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">{feedback.content}</p>
                  {feedback.replies && feedback.replies.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                      <MessageSquare className="h-4 w-4" />
                      <span>{feedback.replies.length} 条回复</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 详情对话框 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant={getMessageTypeVariant(selectedFeedback?.message_type || 'feedback')}>
                  {getMessageTypeLabel(selectedFeedback?.message_type || '')}
                </Badge>
                {selectedFeedback?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-6">
                {/* 原始消息 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {selectedFeedback.sender_type === 'platform' ? '平台' : '我'} · {' '}
                      {new Date(selectedFeedback.created_at).toLocaleString('zh-CN')}
                    </span>
                    {selectedFeedback.status === 'read' && (
                      <Badge variant="secondary">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        已读
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedFeedback.content}</p>
                  </div>
                </div>

                {/* 回复列表 */}
                {selectedFeedback.replies && selectedFeedback.replies.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">回复记录</span>
                    </div>
                    {selectedFeedback.replies.map((reply) => (
                      <div key={reply.id} className="space-y-2 pl-4 border-l-2 border-primary">
                        <div className="text-sm text-muted-foreground">
                          {reply.sender_type === 'platform' ? '平台' : '我'} · {' '}
                          {new Date(reply.created_at).toLocaleString('zh-CN')}
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 回复输入框 */}
                <div className="space-y-2">
                  <Label htmlFor="reply">回复</Label>
                  <Textarea
                    id="reply"
                    placeholder="输入您的回复..."
                    rows={4}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleReply} disabled={submitting}>
                      <Send className="h-4 w-4 mr-2" />
                      发送回复
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}
