import { Dice1, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Model } from '@/lib/data'

interface BasicSettingsProps {
  models: Model[] | undefined
  password: string
  setPassword: (password: string) => void
  prompt: string
  setPrompt: (prompt: string) => void
  negativePrompt: string
  setNegativePrompt: (negativePrompt: string) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  handleRandomPrompt: () => void
  isPasswordRequired: boolean
}

export function BasicSettings({
  models,
  password,
  setPassword,
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  selectedModel,
  setSelectedModel,
  handleRandomPrompt,
  isPasswordRequired,
}: BasicSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            基本设置
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRandomPrompt}>
            <Dice1 className="w-4 h-4 mr-1" />
            随机提示词
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">
            访问密码
            {isPasswordRequired && (
              <span className="text-red-500 text-xs">
                (已配置密码，输出密码才可生成图像)
              </span>
            )}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="请输入访问密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">正向提示词</Label>
          <Textarea
            id="prompt"
            rows={3}
            placeholder="描述您想要生成的图像内容及样式..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="negative_prompt">反向提示词</Label>
          <Textarea
            id="negative_prompt"
            rows={2}
            placeholder="描述在生成的图像中要避免的元素文本..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">文生图模型</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              {models?.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
