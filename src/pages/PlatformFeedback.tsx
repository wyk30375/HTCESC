import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { feedbackApi, dealershipsApi } from '@/db/api';
import type { Feedback, Dealership } from '@/types/types';
import { toast } from 'sonner';
import { MessageSquare, Send, Bell, CheckCircle2, Clock, Plus, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlatformFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [newReminder, setNewReminder] = useState({ dealership_id: '', title: '', content: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbackData, dealershipData] = await Promise.all([
        feedbackApi.getAll(),
        dealershipsApi.getAll(),
      ]);
      setFeedbacks(feedbackData);
      setDealerships(dealershipData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!newReminder.dealership_id || !newReminder.title.trim() || !newReminder.content.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      setSubmitting(true);
      await feedbackApi.create({
        dealership_id: newReminder.dealership_id,
        sender_type: 'platform',
        message_type: 'reminder',
        title: newReminder.title,
        content: newReminder.content,
      });
      toast.success('提醒已发送');
      setNewReminder({ dealership_id: '', title: '', content: '' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('发送提醒失败:', error);
      toast.error('发送提醒失败');
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
        dealership_id: selectedFeedback.dealership_id,
        sender_type: 'platform',
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
        // 如果是未读的车行消息，标记为已读
        if (detail.status === 'unread' && detail.sender_type === 'dealership') {
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
      case 'feedback': return '车行反馈';
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
      <PageWrapper title="反馈管理" description="管理车行反馈和发送提醒">
        <div className="space-y-4">
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="反馈管理" description="管理车行反馈和发送提醒">
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
              {feedbacks.filter(f => f.status === 'unread' && f.sender_type === 'dealership').length} 条未读
            </Badge>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                发送提醒
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>发送提醒给车行</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dealership">选择车行</Label>
                  <Select
                    value={newReminder.dealership_id}
                    onValueChange={(value) => setNewReminder({ ...newReminder, dealership_id: value })}
                  >
                    <SelectTrigger id="dealership">
                      <SelectValue placeholder="请选择车行" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealerships.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    placeholder="请输入提醒标题"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">内容</Label>
                  <Textarea
                    id="content"
                    placeholder="请输入提醒内容..."
                    rows={8}
                    value={newReminder.content}
                    onChange={(e) => setNewReminder({ ...newReminder, content: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSendReminder} disabled={submitting}>
                    <Send className="h-4 w-4 mr-2" />
                    发送
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
                <p className="text-sm mt-2">点击"发送提醒"向车行发送通知</p>
              </CardContent>
            </Card>
          ) : (
            feedbacks.map((feedback) => (
              <Card
                key={feedback.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  feedback.status === 'unread' && feedback.sender_type === 'dealership'
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
                        {feedback.dealership && (
                          <Badge variant="outline">
                            <Building2 className="h-3 w-3 mr-1" />
                            {feedback.dealership.name}
                          </Badge>
                        )}
                        {feedback.status === 'unread' && feedback.sender_type === 'dealership' && (
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
                {selectedFeedback?.dealership && (
                  <Badge variant="outline">
                    <Building2 className="h-3 w-3 mr-1" />
                    {selectedFeedback.dealership.name}
                  </Badge>
                )}
                {selectedFeedback?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-6">
                {/* 原始消息 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {selectedFeedback.sender_type === 'platform' ? '平台' : selectedFeedback.dealership?.name} · {' '}
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
                          {reply.sender_type === 'platform' ? '平台' : selectedFeedback.dealership?.name} · {' '}
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
