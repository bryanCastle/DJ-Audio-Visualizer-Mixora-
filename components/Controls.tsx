import { useStore } from '../store/visualizerStore'

const Controls = () => {
  const { color, effect, setColor, setEffect } = useStore()

  return (
    <div className="bg-black bg-opacity-50 p-4 rounded-lg text-white">
      <div className="mb-4">
        <label className="block mb-2">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-8"
        />
      </div>
      <div>
        <label className="block mb-2">Effect</label>
        <select
          value={effect}
          onChange={(e) => setEffect(e.target.value as any)}
          className="w-full p-2 bg-gray-800 rounded"
        >
          <option value="bars">Bars</option>
          <option value="wave">Wave</option>
          <option value="particles">Particles</option>
          <option value="sphere">Sphere</option>
          <option value="rings">Rings</option>
        </select>
      </div>
    </div>
  )
}

export default Controls 