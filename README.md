## Engineering focus

SkillForge Academy is an **applied AI product** focused on turning learner context into personalized learning and career pathways.

### Product workflow

```text
Learner goals + skill context
            ↓
      AI-generated pathway
            ↓
 Resource recommendations
            ↓
 Conversational assistance
            ↓
      Progress tracking
```

### Engineering signal

The project demonstrates the integration of an AI capability into a user-facing product workflow: collecting context, generating structured recommendations, persisting user progress, and exposing the result through a web application.

### Scope

This is an applied product project rather than a claim of novel model research. The engineering focus is the surrounding product workflow and AI integration.

---


# SkillForge Academy

**SkillForge Academy** is an AI-driven platform designed to provide personalized learning and career pathways for individuals seeking to enhance their skills and advance their careers.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)


## Features

- **Personalized Learning Roadmaps**: AI-generated pathways tailored to individual goals and skill levels.
- **Real-Time Course Recommendations**: Up-to-date suggestions for top-rated courses.
- **Interactive Chatbot Assistance**: Real-time support for user queries and guidance.
- **Progress Tracking**: Monitor and assess your learning journey.

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **AI Integration**: OpenAI's GPT-4 via Thinkstack.ai
- **Database**: Supabase
- **Deployment**: Vercel

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/laxmi-narayan-87/learning-pathfinder-08.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd learning-pathfinder-08
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Set up environment variables**:

   Create a `.env` file in the root directory and add the necessary environment variables:

   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   ```

5. **Start the development server**:

   ```bash
   npm start
   ```

   The application should now be running at `http://localhost:3000`.

## Usage

1. **Sign Up / Log In**: Create an account or log in with your existing credentials.
2. **Set Your Goals**: Input your career aspirations and current skill levels.
3. **Receive Personalized Roadmap**: View your AI-generated learning pathway.
4. **Explore Course Recommendations**: Access suggested courses aligned with your roadmap.
5. **Interact with the Chatbot**: Get real-time assistance and answers to your queries.
6. **Track Progress**: Monitor your advancement through the learning modules.

## Contributing

We welcome contributions from the community. To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeatureName`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/YourFeatureName`.
5. Open a pull request detailing your changes.

Please ensure your code adheres to our coding standards and includes relevant tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

