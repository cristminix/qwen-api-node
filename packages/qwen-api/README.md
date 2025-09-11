# Qwen API

Sebuah pustaka TypeScript untuk berinteraksi dengan berbagai API AI, termasuk Qwen, Blackbox, dan penyedia layanan lainnya melalui proxy CORS.

## Instalasi

```bash
pnpm install
```

## Pengaturan

Salin file `.env.example` ke `.env` dan isi dengan kredensial yang sesuai:

```bash
cp .env.example .env
```

## Contoh Penggunaan

### Qwen API

```bash
# Penggunaan dasar
npx tsx examples/basic_usage.ts

# Penggunaan streaming
npx tsx examples/basic_usage_stream.ts
```

### Blackbox API

```bash
# Penggunaan dasar
npx tsx examples-blackbox/basic_usage.ts

# Penggunaan streaming
npx tsx examples-blackbox/basic_usage_stream.ts
```

### PollinationsAI (Tanpa API Key)

```bash
# Penggunaan dasar
npx tsx examples/pollinations_basic_usage.ts

# Penggunaan streaming
npx tsx examples/pollinations_stream_usage.ts
```

### HuggingFace (Memerlukan API Key)

```bash
# Penggunaan dasar
npx tsx examples/huggingface_basic_usage.ts

# Penggunaan streaming
npx tsx examples/huggingface_stream_usage.ts
```

### G4F

## Usage

`http://localhost:3001/usages/DeepInfra?ipaddr=172.236.145.155`

## Lisensi

MIT
