'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Dice1,
  Download,
  Loader2,
  Shuffle,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { genid } from '@/lib'

interface Model {
  id: string
  name: string
  description: string
  key: string
}

interface ErrorResponse {
  error?: string
}

interface GenerateParams {
  prompt: string
  model: string
  password?: string
  negative_prompt?: string
  width?: number
  height?: number
  num_steps?: number
  guidance?: number
  seed?: number
}

async function fetchModels(): Promise<Model[]> {
  const response = await fetch('/api/models')
  if (!response.ok) {
    throw new Error('Failed to fetch models')
  }
  return response.json()
}

async function fetchPrompts(): Promise<string[]> {
  const response = await fetch('/api/prompts')
  if (!response.ok) {
    throw new Error('Failed to fetch prompts')
  }
  return response.json()
}

async function generateImage(params: GenerateParams): Promise<Blob> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const errorData = (await response.json()) as ErrorResponse
      throw new Error(errorData.error || 'Failed to generate image')
    }
    throw new Error('Failed to generate image')
  }

  return response.blob()
}

export default function Home() {
  const [prompt, setPrompt] = useState('cyberpunk cat')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [password, setPassword] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Advanced options
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  const [numSteps, setNumSteps] = useState(20)
  const [guidance, setGuidance] = useState(7.5)
  const [seed, setSeed] = useState<number | ''>('')

  // Generation state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationTime, setGenerationTime] = useState<number | null>(null)
  const [currentParams, setCurrentParams] = useState<GenerateParams | null>(
    null,
  )

  const { data: models } = useQuery<Model[]>({
    queryKey: ['models'],
    queryFn: fetchModels,
  })

  const { data: prompts } = useQuery<string[]>({
    queryKey: ['prompts'],
    queryFn: fetchPrompts,
  })

  const mutation = useMutation({
    mutationFn: generateImage,
    onMutate: () => {
      setGenerationTime(null)
    },
    onSuccess: (blob) => {
      const imageUrl = URL.createObjectURL(blob)
      setGeneratedImage(imageUrl)
      toast.success('图像生成成功！')
    },
    onError: (error: Error) => {
      toast.error(error.message || '生成失败')
    },
  })

  const handleGenerateClick = () => {
    const startTime = performance.now()

    const params: GenerateParams = {
      prompt,
      model: selectedModel,
      password: password || undefined,
      negative_prompt: negativePrompt || undefined,
      width,
      height,
      num_steps: numSteps,
      guidance,
      seed: seed || undefined,
    }

    setCurrentParams(params)

    mutation.mutate(params, {
      onSuccess: () => {
        const endTime = performance.now()
        setGenerationTime((endTime - startTime) / 1000)
      },
    })
  }

  const handleRandomPrompt = () => {
    if (prompts && prompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * prompts.length)
      setPrompt(prompts[randomIndex])
    }
  }

  const handleRandomSeed = () => {
    setSeed(genid.nextNumber())
  }

  const handleCopyParams = () => {
    if (!currentParams) return

    let paramsText = '--- AI绘图创作生成参数 ---\n'
    const paramNames: Record<string, string> = {
      prompt: '正向提示词',
      negative_prompt: '反向提示词',
      model: '文生图模型',
      width: '图像宽度',
      height: '图像高度',
      num_steps: '迭代步数',
      guidance: '引导系数',
      seed: '随机种子',
    }

    Object.entries(currentParams).forEach(([key, value]) => {
      if (key === 'password' || !value) return
      const name = paramNames[key] || key
      paramsText += `${name}: ${value}\n`
    })

    navigator.clipboard.writeText(paramsText).then(
      () => toast.success('参数已复制到剪贴板'),
      () => toast.error('复制失败'),
    )
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const modelName =
      models?.find((m) => m.id === selectedModel)?.name || 'ai-image'
    link.download = `${modelName}-${timestamp}.png`
    link.click()
    toast.success('图像下载成功')
  }

  // Set default model when models are loaded
  useEffect(() => {
    if (models && models.length > 0 && !selectedModel) {
      setSelectedModel(models[1]?.id || models[0].id)
    }
  }, [models, selectedModel])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">🐳 在线文生图服务</h1>
          <ThemeToggle />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    基本设置
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRandomPrompt}
                  >
                    <Dice1 className="w-4 h-4 mr-1" />
                    随机提示词
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">访问密码</Label>
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
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
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

            {/* Advanced Options */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>高级选项</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? (
                      <ChevronUp className="w-4 h-4 mr-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-1" />
                    )}
                    {showAdvanced ? '隐藏' : '显示'}
                  </Button>
                </div>
              </CardHeader>
              {showAdvanced && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="width">图像宽度</Label>
                      <span className="text-sm font-mono">{width}px</span>
                    </div>
                    <Input
                      id="width"
                      type="range"
                      min={256}
                      max={2048}
                      step={64}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="height">图像高度</Label>
                      <span className="text-sm font-mono">{height}px</span>
                    </div>
                    <Input
                      id="height"
                      type="range"
                      min={256}
                      max={2048}
                      step={64}
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="num_steps">迭代步数</Label>
                      <span className="text-sm font-mono">{numSteps}</span>
                    </div>
                    <Input
                      id="num_steps"
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={numSteps}
                      onChange={(e) => setNumSteps(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="guidance">引导系数</Label>
                      <span className="text-sm font-mono">
                        {guidance.toFixed(1)}
                      </span>
                    </div>
                    <Input
                      id="guidance"
                      type="range"
                      min={0}
                      max={30}
                      step={0.5}
                      value={guidance}
                      onChange={(e) => setGuidance(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seed">随机种子</Label>
                    <div className="flex gap-2">
                      <Input
                        id="seed"
                        type="number"
                        placeholder="留空则随机生成"
                        value={seed}
                        onChange={(e) =>
                          setSeed(e.target.value ? Number(e.target.value) : '')
                        }
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRandomSeed}
                      >
                        <Shuffle className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      使用相同的种子值可以在其他参数相同的情况下生成相似的图像
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Generate Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerateClick}
              disabled={mutation.isPending || !selectedModel}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成图像
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Image Display */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>生成结果</CardTitle>
                  {generatedImage && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyParams}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        复制参数
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载图像
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Container */}
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  {mutation.isPending && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                      <p className="text-white mt-3 font-medium">
                        生成中,请稍候...
                      </p>
                      <p className="text-white/80 text-sm mt-1">
                        这可能需要几秒到几十秒不等
                      </p>
                    </div>
                  )}

                  {!generatedImage && !mutation.isPending && (
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p>点击生成按钮开始创建图像</p>
                    </div>
                  )}

                  {generatedImage && (
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>

                {/* Image Info */}
                {generatedImage && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">生成时间：</span>
                        <span className="ml-1">
                          {generationTime?.toFixed(2)}秒
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">使用模型：</span>
                        <span className="ml-1">
                          {models?.find((m) => m.id === selectedModel)?.name ||
                            '-'}
                        </span>
                      </div>
                    </div>

                    {currentParams && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-medium mb-2">所有参数</h3>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(currentParams).map(
                              ([key, value]) => {
                                if (key === 'password' || !value) return null
                                const paramNames: Record<string, string> = {
                                  prompt: '提示词',
                                  negative_prompt: '反向提示词',
                                  model: '模型',
                                  width: '宽度',
                                  height: '高度',
                                  num_steps: '步数',
                                  guidance: '引导',
                                  seed: '种子',
                                }
                                return (
                                  <div
                                    key={key}
                                    className="text-xs bg-secondary px-2 py-1 rounded"
                                  >
                                    <span className="font-medium">
                                      {paramNames[key] || key}:
                                    </span>{' '}
                                    {String(value).substring(0, 50)}
                                    {String(value).length > 50 ? '...' : ''}
                                  </div>
                                )
                              },
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
