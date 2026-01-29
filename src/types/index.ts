export interface Model {
  id: string
  name: string
  description: string
  key: string
  disabled: boolean
  group: string
}

export interface ModelGroup {
  id: string
  name: string
  image?: string
  models: Model[]
}
