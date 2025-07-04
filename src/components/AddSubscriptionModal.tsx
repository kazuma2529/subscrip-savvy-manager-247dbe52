import React, { useState } from 'react';
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

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: any) => void;
}

const categories = ['AI', '音楽', '趣味', 'ビジネス', 'エンタメ', '英語', 'その他'];

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    cardName: '',
    subscriptionType: 'normal', // 'trial' or 'normal'
    nextPayment: undefined as Date | undefined,
    trialEndDate: undefined as Date | undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subscription = {
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      cardName: formData.cardName,
      isTrialPeriod: formData.subscriptionType === 'trial',
      nextPayment: formData.subscriptionType === 'trial' 
        ? (formData.trialEndDate ? format(formData.trialEndDate, 'yyyy-MM-dd') : format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')) // トライアル期間中はトライアル終了日、未選択なら1週間後
        : (formData.nextPayment ? format(formData.nextPayment, 'yyyy-MM-dd') : format(getDefaultDate(), 'yyyy-MM-dd')),
      trialEndDate: formData.subscriptionType === 'trial' && formData.trialEndDate 
        ? format(formData.trialEndDate, 'yyyy-MM-dd') 
        : undefined,
    };
    
    onAdd(subscription);
    
    // Reset form
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

  const getDefaultDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] bg-slate-800 border-slate-700 p-4 md:p-6 overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-white text-lg md:text-xl">新しいサブスクを追加</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-sm md:text-base">サービス名</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Netflix, ChatGPT Plus など"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-10 md:h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-white text-sm md:text-base">月額料金 (円)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="1490"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-10 md:h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm md:text-base">カテゴリ</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-10 md:h-12">
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
            <Label htmlFor="cardName" className="text-white text-sm md:text-base">使用カード名</Label>
            <Input
              id="cardName"
              value={formData.cardName}
              onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
              placeholder="my fav card, 予備カード など"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-10 md:h-12"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white text-sm md:text-base">サブスク種別</Label>
            <RadioGroup
              value={formData.subscriptionType}
              onValueChange={(value) => setFormData({ ...formData, subscriptionType: value })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700/50">
                <RadioGroupItem value="normal" id="normal" className="border-slate-400" />
                <Label htmlFor="normal" className="text-white text-sm md:text-base cursor-pointer flex-1">通常サブスク</Label>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700/50">
                <RadioGroupItem value="trial" id="trial" className="border-slate-400" />
                <Label htmlFor="trial" className="text-white text-sm md:text-base cursor-pointer flex-1">無料トライアル中</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.subscriptionType === 'trial' ? (
            <div className="space-y-2">
              <Label className="text-white text-sm md:text-base">トライアル終了日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-10 md:h-12"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm md:text-base">
                      {formData.trialEndDate ? format(formData.trialEndDate, 'yyyy年MM月dd日', { locale: ja }) : '日付を選択'}
                    </span>
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
              <Label className="text-white text-sm md:text-base">次回更新日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-10 md:h-12"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm md:text-base">
                      {formData.nextPayment ? format(formData.nextPayment, 'yyyy年MM月dd日', { locale: ja }) : '日付を選択 (デフォルト: 1ヶ月後)'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                  <Calendar
                    mode="single"
                    selected={formData.nextPayment || getDefaultDate()}
                    onSelect={(date) => setFormData({ ...formData, nextPayment: date })}
                    defaultMonth={getDefaultDate()}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex gap-3 pt-4 md:pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-slate-600 text-gray-800 hover:bg-slate-700 hover:text-gray-800 bg-white h-10 md:h-12 text-sm md:text-base"
            >
              キャンセル
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-10 md:h-12 text-sm md:text-base"
            >
              追加
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubscriptionModal;
