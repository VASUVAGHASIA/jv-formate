# Dynamic Model Selection Feature

## Overview
This feature allows the app to fetch available Gemini AI models from the API and display them dynamically in a dropdown menu.

## Implementation

### 1. **listModels Function** (`src/utils/gemini.ts`)
```typescript
export const listModels = async (): Promise<string[]> => {
  try {
    const ai = getAIClient();
    const modelsPager = await ai.models.list();
    const modelsList: string[] = [];
    
    // Iterate through the pager to get all models
    for await (const model of modelsPager) {
      if (model.name) {
        modelsList.push(model.name);
      }
    }
    
    return modelsList;
  } catch (error) {
    console.error("❌ Failed to fetch models:", error);
    // Return default models as fallback
    return [
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro"
    ];
  }
};
```

**Key Features:**
- Fetches available models from the Gemini API using the `ai.models.list()` method
- Iterates through the pager to collect all model names
- Filters out undefined names
- Returns a fallback list of default models if the API call fails

### 2. **ChatWindow Component** (`src/components/ChatWindow.tsx`)

**State Management:**
```typescript
const [availableModels, setAvailableModels] = useState<string[]>([]);
```

**Fetch Models on Mount:**
```typescript
useEffect(() => {
  // Fetch available models on component mount
  const fetchModels = async () => {
    try {
      const models = await listModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };
  fetchModels();
}, []);
```

**Dynamic Dropdown:**
```tsx
<select
  value={selectedModel}
  onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
  className="text-[10px] border-none bg-transparent p-0 focus:outline-none focus:ring-0 text-gray-500 cursor-pointer"
  title="Select AI Model"
>
  {availableModels.length > 0 ? (
    availableModels.map((model) => (
      <option key={model} value={model}>
        {model.replace('gemini-', '').replace('-', ' ')}
      </option>
    ))
  ) : (
    <>
      <option value="gemini-2.0-flash-exp">2.0 Flash (Exp)</option>
      <option value="gemini-2.0-flash-lite">2.0 Flash Lite</option>
      <option value="gemini-1.5-flash">1.5 Flash</option>
      <option value="gemini-1.5-flash-8b">1.5 Flash 8B</option>
      <option value="gemini-1.5-pro">1.5 Pro</option>
    </>
  )}
</select>
```

## How It Works

1. **On Component Mount**: The `ChatWindow` component calls `listModels()` to fetch available models from the Gemini API
2. **Store Models**: The fetched models are stored in the `availableModels` state
3. **Display in Dropdown**: The dropdown menu renders the available models dynamically
4. **Fallback**: If models haven't loaded yet or if the API call fails, hardcoded default models are shown
5. **Model Display**: Model names are formatted for better readability (e.g., "gemini-2.0-flash-exp" becomes "2.0 flash exp")

## Benefits

- ✅ **Dynamic**: Always shows the latest available models from Google's API
- ✅ **Resilient**: Falls back to default models if API fails
- ✅ **User-Friendly**: Formats model names for better readability
- ✅ **Automatic**: No manual updates needed when new models are released

## Testing

To test this feature:
1. Start the development server: `npm start`
2. Open the add-in in Word
3. Navigate to the Chat window
4. Check the model dropdown - it should show models fetched from the API
5. If API is unavailable, it should show the default fallback models

## Error Handling

The implementation includes robust error handling:
- API failures trigger a console error and return fallback models
- Empty model names are filtered out
- The UI gracefully handles the loading state by showing defaults until models are fetched
