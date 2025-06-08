import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (id: number | string) => void;
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'AI': 'bg-purple-500',
    '音楽': 'bg-pink-500',
    '趣味': 'bg-green-500',
    'ビジネス': 'bg-blue-500',
    'エンタメ': 'bg-red-500',
    '英語': 'bg-yellow-500',
    'その他': 'bg-gray-500',
  };
  return colors[category] || 'bg-gray-500';
};

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  subscription, 
  onEdit, 
  onDelete 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { id, name, price, category, cardName, nextPayment, isTrialPeriod, trialEndDate } = subscription;
  
  const today = new Date();
  const paymentDate = new Date(nextPayment);
  const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isUrgent = daysUntilPayment <= 3;
  const displayDate = isTrialPeriod && trialEndDate ? trialEndDate : nextPayment;

  const handleEdit = () => {
    onEdit?.(subscription);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-3 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* モバイル: サービス名を上、価格と日付を下に表示 */}
          <div className="mb-2 md:hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${getCategoryColor(subscription.category)}`}></div>
              <h3 className="text-base font-semibold text-white truncate">
                {subscription.name}
              </h3>
              {subscription.isTrialPeriod && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                  トライアル
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-white">
                ¥{subscription.price.toLocaleString()}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-300">
                  次回支払い{subscription.isTrialPeriod ? '(トライアル終了)' : ''}まで
                </div>
                <div className="text-sm font-semibold text-blue-300">
                  あと{daysUntilPayment}日
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 text-xs text-slate-300 mt-1">
              <span>カード: {subscription.cardName}</span>
              <span>•</span>
              <span>カテゴリ: {subscription.category}</span>
            </div>
          </div>

          <div className="flex-1 mb-2 md:mb-0 hidden md:block">
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <div className={`w-3 h-3 rounded-full ${getCategoryColor(subscription.category)}`}></div>
              <h3 className="text-base md:text-xl font-semibold text-white truncate">
                {subscription.name}
              </h3>
              {subscription.isTrialPeriod && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs md:text-sm">
                  トライアル
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1 md:gap-2 text-xs md:text-sm text-slate-300">
              <span>カード: {subscription.cardName}</span>
              <span>•</span>
              <span>カテゴリ: {subscription.category}</span>
            </div>
          </div>

          {/* デスクトップ: 右側に価格と日付を表示 */}
          <div className="hidden md:flex md:flex-col md:items-end md:mr-4">
            <div className="text-2xl font-bold text-white mb-1">
              ¥{subscription.price.toLocaleString()}
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300">
                次回支払い{subscription.isTrialPeriod ? '(トライアル終了)' : ''}まで
              </div>
              <div className="text-lg font-semibold text-blue-300">
                あと{daysUntilPayment}日
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2 md:mt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="flex-1 md:flex-none h-8 md:h-10 px-2 md:px-4 text-xs md:text-sm text-white hover:bg-white/10 border border-white/20"
            >
              <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="md:inline">編集</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 md:flex-none h-8 md:h-10 px-2 md:px-4 text-xs md:text-sm text-red-300 hover:bg-red-500/10 border border-red-500/20"
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="md:inline">削除</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">サブスクリプションを削除</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              「{name}」を削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              onClick={() => setShowDeleteDialog(false)}
            >
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteConfirm}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SubscriptionCard;