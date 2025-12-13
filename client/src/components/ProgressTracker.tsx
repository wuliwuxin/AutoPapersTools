/**
 * Progress Tracker Component
 * Shows real-time progress of analysis tasks
 */

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProgressTrackerProps {
  taskId: string;
  onComplete?: (success: boolean) => void;
}

export function ProgressTracker({ taskId, onComplete }: ProgressTrackerProps) {
  const [lastStatus, setLastStatus] = useState<string>('');

  const { data: task } = trpc.papers.getAnalysisStatus.useQuery(
    { taskId },
    {
      refetchInterval: (query) => {
        // 如果任务完成或失败，停止轮询
        const taskData = query.state.data;
        if (taskData?.status === 'completed' || taskData?.status === 'failed') {
          return false;
        }
        // 否则每2秒轮询一次
        return 2000;
      },
    }
  );

  useEffect(() => {
    if (task && task.status !== lastStatus) {
      setLastStatus(task.status);

      if (task.status === 'completed') {
        toast.success('分析完成', {
          description: '论文分析已完成，正在加载报告...',
        });
        onComplete?.(true);
      } else if (task.status === 'failed') {
        toast.error('分析失败', {
          description: task.errorMessage || '分析过程中发生错误',
        });
        onComplete?.(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, lastStatus]);

  if (!task) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading task status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'pending':
        return 'Waiting to start...';
      case 'processing':
        return 'Analyzing paper...';
      case 'completed':
        return 'Analysis complete!';
      case 'failed':
        return 'Analysis failed';
      default:
        return task.status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          <span>Analysis Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>{getStatusText()}</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={task.progress} />
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Provider:</span>
            <span className="capitalize font-medium">{task.provider}</span>
          </div>
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="font-medium">{task.modelName}</span>
          </div>
          {task.tokensUsed && (
            <div className="flex justify-between">
              <span>Tokens Used:</span>
              <span className="font-medium">{task.tokensUsed.toLocaleString()}</span>
            </div>
          )}
          {task.costEstimate && (
            <div className="flex justify-between">
              <span>Estimated Cost:</span>
              <span className="font-medium">${task.costEstimate.toFixed(4)}</span>
            </div>
          )}
        </div>

        {task.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {task.errorMessage}
          </div>
        )}

        {task.status === 'completed' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            Analysis completed successfully! You can now view the full report.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
