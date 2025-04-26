# Crop Disease Diagnosis Platform

A modern web application for detecting and diagnosing plant diseases using deep learning with TensorFlow.js. This application helps farmers and gardeners identify plant diseases quickly and accurately.

## Features

- **AI-Powered Disease Detection**: Utilize a Convolutional Neural Network (CNN) model to identify plant diseases from images
- **Real-time Diagnosis**: Get immediate results with confidence scores and detailed treatment recommendations
- **Comprehensive Database**: Access a library of common plant diseases with symptoms and treatments
- **Mobile-Friendly Interface**: Capture photos directly from your device's camera
- **Cross-Platform Compatibility**: Works on all modern browsers and devices
- **History Tracking**: Save and review past diagnoses with feedback system

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide React icons
- **AI/ML**: TensorFlow.js, MobileNet (feature extraction)
- **Database & Storage**: Supabase (PostgreSQL + Storage)
- **Performance**: Web Workers for non-blocking ML inference

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/crop-disease-diagnose.git
   cd crop-disease-diagnose
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup (Optional)

If you want to use Supabase for storing diagnosis history:

1. Create a new Supabase project
2. Run the SQL scripts in the `supabase/migrations` folder
3. Set up storage bucket named `plant-images` with public read access

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Import your repository in Vercel
3. Configure the environment variables
4. Deploy

### Production Build

To create a production build:

```bash
npm run build
npm start
```

## Model Training (Advanced)

For those interested in training a custom plant disease detection model:

1. Collect a dataset of plant disease images
2. Use TensorFlow/PyTorch to train a model
3. Convert the model to TensorFlow.js format
4. Replace the model in the `public/models` directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Plant Village Dataset for training data reference
- TensorFlow.js team for the incredible browser ML capabilities
