import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Subscription {
  id: number | string;
  name: string;
  price: number;
  category: string;
  cardName: string;
  nextPayment: string;
  isTrialPeriod?: boolean;
  trialEndDate?: string;
}

interface EditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string | number, updates: any) => void;
  subscription: Subscription | null;
}

const categories = ['AI', '音楽', '趣味', 'ビジネス', 'エンタメ', '英語', 'その他'];

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  subscription 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    cardName: '',
    subscriptionType: 'normal', // 'trial' or 'normal'
    nextPayment: undefined as Date | undefined,
    trialEndDate: undefined as Date | undefined,
  });

  // モーダルが開いたときにサブスクリプションデータをフォームに設定
  useEffect(() => {
    if (subscription && isOpen) {
      setFormData({
        name: subscription.name,
        price: subscription.price.toString(),
        category: subscription.category,
        cardName: subscription.cardName,
        subscriptionType: subscription.isTrialPeriod ? 'trial' : 'normal',
        nextPayment: subscription.nextPayment ? new Date(subscription.nextPayment) : undefined,
        trialEndDate: subscription.trialEndDate ? new Date(subscription.trialEndDate) : undefined,
      });
    }
  }, [subscription, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscription) return;

    const updates = {
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      card_name: formData.cardName,
      is_trial_period: formData.subscriptionType === 'trial',
      next_payment: formData.nextPayment ? format(formData.nextPayment, 'yyyy-MM-dd') : subscription.nextPayment,
      trial_end_date: formData.subscriptionType === 'trial' && formData.trialEndDate 
        ? format(formData.trialEndDate, 'yyyy-MM-dd') 
        : null,
    };
    
    onSave(subscription.id, updates);
    onClose();
  };

  const handleClose = () => {
    onClose();
    // フォームをリセット
    setFormData({
      name: '',
      price: '',
      category: '',
      cardName: '',
      subscriptionType: 'normal',
      nextPayment: undefined,
      trialEndDate: undefined,
    });
  };

  if (!subscription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">サブスクリプションを編集</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-white">サービス名</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Netflix, ChatGPT Plus など"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-price" className="text-white">月額料金 (円)</Label>
            <Input
              id="edit-price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="1490"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">カテゴリ</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-slate-600">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cardName" className="text-white">使用カード名</Label>
            <Input
              id="edit-cardName"
              value={formData.cardName}
              onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
              placeholder="my fav card, 予備カード など"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white">サブスク種別</Label>
            <RadioGroup
              value={formData.subscriptionType}
              onValueChange={(value) => setFormData({ ...formData, subscriptionType: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="edit-normal" className="border-slate-400" />
                <Label htmlFor="edit-normal" className="text-white">通常サブスク</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="trial" id="edit-trial" className="border-slate-400" />
                <Label htmlFor="edit-trial" className="text-white">無料トライアル中</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.subscriptionType === 'trial' ? (
            <div className="space-y-2">
              <Label className="text-white">トライアル終了日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.trialEndDate ? format(formData.trialEndDate, 'yyyy年MM月dd日', { locale: ja }) : '日付を選択'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                  <Calendar
                    mode="single"
                    selected={formData.trialEndDate}
                    onSelect={(date) => setFormData({ ...formData, trialEndDate: date })}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-white">次回更新日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.nextPayment ? format(formData.nextPayment, 'yyyy年MM月dd日', { locale: ja }) : '日付を選択'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                  <Calendar
                    mode="single"
                    selected={formData.nextPayment}
                    onSelect={(date) => setFormData({ ...formData, nextPayment: date })}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              キャンセル
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              保存
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscriptionModal;