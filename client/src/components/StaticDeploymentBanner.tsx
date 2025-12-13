/**
 * Banner to inform users about static deployment limitations
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { isGitHubPages } from "@/lib/env";

interface StaticDeploymentBannerProps {
  feature?: string;
}

export function StaticDeploymentBanner({ feature }: StaticDeploymentBannerProps) {
  // Only show in GitHub Pages environment
  if (!isGitHubPages()) return null;

  const featureMessage = feature 
    ? `${feature}功能在静态部署环境下不可用。` 
    : "此功能在静态部署环境下不可用。";

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertTitle>静态部署模式</AlertTitle>
      <AlertDescription>
        {featureMessage}
        需要后端 API 支持的功能（如用户认证、数据库存储）在 GitHub Pages 上无法使用。
        如需完整功能，请考虑部署到 Vercel 或其他支持全栈应用的平台。
      </AlertDescription>
    </Alert>
  );
}
