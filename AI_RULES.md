# AI Studio Application Rules

This document outlines the core technologies and guidelines for developing and modifying the Quantum educational platform.

## Tech Stack Overview

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui (pre-installed)
*   **Routing**: React Router
*   **Backend/Database**: Supabase (for data persistence and authentication)
*   **Build Tool**: Vite
*   **PDF Generation**: html2canvas and jspdf
*   **Icons**: Lucide React

## Library Usage Rules

To maintain consistency and efficiency, please adhere to the following guidelines when working with libraries:

*   **React**: Use React for all UI components, state management, and application logic.
*   **TypeScript**: All new and modified `.tsx` files must use TypeScript for type safety and improved code quality.
*   **Tailwind CSS**: All styling must be done exclusively using Tailwind CSS utility classes. Avoid custom CSS files or inline styles unless absolutely necessary for dynamic values.
*   **shadcn/ui**: Prioritize using pre-built components from the shadcn/ui library for common UI elements (e.g., buttons, forms, modals, cards). Only create new components if shadcn/ui does not offer a suitable alternative or if extensive customization is required.
*   **React Router**: Manage application navigation and different views (e.g., dashboard, course, admin, profile, certificate). Routes should be defined and handled within `src/App.tsx`.
*   **Supabase**: Interact with the database for all data operations, including fetching course content, managing user profiles, and handling authentication. Use the `supabase` client initialized in `lib/supabaseClient.ts`.
*   **html2canvas & jspdf**: These libraries are specifically designated for the functionality of generating and downloading PDF certificates.
*   **Lucide React**: Use icons from the `lucide-react` package for all icon needs throughout the application.