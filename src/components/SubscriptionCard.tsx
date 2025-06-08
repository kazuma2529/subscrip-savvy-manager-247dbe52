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
      <Card className={`bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-200 ${isUrgent ? 'ring-2 ring-orange-400' : ''}`}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                <h3 className="text-base md:text-lg font-semibold text-white">{name}</h3>
                {isTrialPeriod && (
                  <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-400">
                    無料トライアル
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between md:flex-col md:items-start md:space-y-1 mb-3">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">¥{price.toLocaleString()}</p>
                  <p className="text-sm text-slate-300">月額</p>
                </div>
                <div className="md:hidden">
                  <Badge 
                    variant={isUrgent ? "destructive" : "outline"}
                    className={isUrgent ? "bg-orange-500 text-white" : "text-slate-300 border-slate-600"}
                  >
                    {displayDate}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 md:gap-0 md:flex-row md:flex-wrap text-sm text-slate-300 mb-3 md:mb-0">
                <span>カード: {cardName}</span>
                <span className="hidden md:inline mx-2">•</span>
                <span>カテゴリ: {category}</span>
              </div>
              
              <div className="mt-3 hidden md:block">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-300">
                    {isTrialPeriod ? 'トライアル終了日:' : '次回支払い:'}
                  </span>
                  <Badge 
                    variant={isUrgent ? "destructive" : "outline"}
                    className={isUrgent ? "bg-orange-500 text-white" : "text-slate-300 border-slate-600"}
                  >
                    {displayDate}
                  </Badge>
                  {daysUntilPayment > 0 && (
                    <span className={`text-xs ${isUrgent ? 'text-orange-300' : 'text-slate-400'}`}>
                      (あと{daysUntilPayment}日)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-2 md:hidden">
                <span className={`text-xs ${isUrgent ? 'text-orange-300' : 'text-slate-400'}`}>
                  {isTrialPeriod ? 'トライアル終了まで' : '次回支払いまで'}あと{daysUntilPayment}日
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 md:flex-col md:ml-4">
              <Button 
                size="sm" 
                variant="ghost" 
                className="flex-1 md:flex-none text-slate-300 hover:text-white hover:bg-white/10 h-10 md:h-auto"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 md:mr-0 mr-2" />
                <span className="md:hidden">編集</span>
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="flex-1 md:flex-none text-slate-300 hover:text-red-400 hover:bg-red-500/10 h-10 md:h-auto"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 md:mr-0 mr-2" />
                <span className="md:hidden">削除</span>
              </Button>
            </div>
          </div>
        </CardContent>
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