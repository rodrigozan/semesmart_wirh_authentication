
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { UserData, Member, Transaction } from './types';
import { defaultUserData } from './data';
import { GoogleGenAI, Type } from "@google/genai";

// --- Gemini API Schema ---
const insightSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
          type: Type.STRING,
          description: 'Um título curto e chamativo para a dica financeira.'
        },
        description: {
          type: Type.STRING,
          description: 'Uma descrição de uma frase, explicando a dica de forma simples e direta.'
        },
    },
    required: ['title', 'description']
};

const checkFirebase = () => {
    if (!auth || !db) {
      throw new Error("Firebase não está configurado. Por favor, adicione suas credenciais em firebaseConfig.ts.");
    }
  };

// --- API Methods ---

const api = {
    /**
     * Authenticates a user using Firebase Auth.
     */
    async login(email: string, password: string): Promise<User> {
        checkFirebase();
        const userCredential = await signInWithEmailAndPassword(auth!, email, password);
        return userCredential.user;
    },

    /**
     * Registers a new user, creates their initial data in Firestore, and returns the user object.
     */
    async register(name: string, title: string, email: string, password: string): Promise<User> {
        checkFirebase();
        const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
        const user = userCredential.user;

        // Create initial user data structure in Firestore
        const firstMember: Member = {
            id: `m${Date.now()}`,
            name: name,
            avatar: '😊',
            role: 'Administrador',
            title: title,
        };
        
        const newUserData: UserData = {
            ...defaultUserData,
            members: [firstMember],
        };
        
        const userDocRef = doc(db!, 'users', user.uid);
        await setDoc(userDocRef, newUserData);

        return user;
    },
    
    /**
     * Signs the user out using Firebase Auth.
     */
    async logout(): Promise<void> {
        checkFirebase();
        await signOut(auth!);
    },

    /**
     * Retrieves the entire data object for a given user from Firestore.
     */
    async getUserData(uid: string): Promise<UserData | null> {
        checkFirebase();
        const userDocRef = doc(db!, 'users', uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserData;
        } else {
            // This case should ideally not be reached for a registered user.
            // But as a fallback, we can create their data.
            console.warn("No user data found in Firestore for UID:", uid, ". Creating default data.");
            const newUserData: UserData = {
                ...defaultUserData,
                 members: [{ id: 'm1', name: 'Eu', avatar: '😊', role: 'Administrador', title: 'Admin' }],
            };
            await this.updateUserData(uid, newUserData);
            return newUserData;
        }
    },

    /**
     * Overwrites the entire data object for a given user in Firestore.
     */
    async updateUserData(uid: string, data: UserData): Promise<UserData> {
        checkFirebase();
        const userDocRef = doc(db!, 'users', uid);
        await setDoc(userDocRef, data);
        return data; // Return the saved data as confirmation
    },

    /**
     * Generates financial insights using the Gemini API based on user transactions.
     */
    async getAIFinancialInsights(transactions: Transaction[]): Promise<{title: string, description: string}[]> {
      if (!process.env.API_KEY) {
        console.error("Gemini API key not found in environment variables.");
        throw new Error("A chave da API para a IA não foi configurada.");
      }
      
      // Initialize Gemini AI client here to prevent app crash on load
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const simplifiedTransactions = transactions.map(({ description, amount, category }) => ({ description, amount, category }));
      
      const prompt = `Você é um consultor financeiro amigável e otimista para uma família. Analise a seguinte lista de despesas recentes e forneça exatamente 3 dicas curtas, práticas e encorajadoras para ajudá-los a economizar dinheiro ou melhorar seus hábitos financeiros. As dicas devem ser acionáveis e baseadas nos dados fornecidos.

      Gastos recentes:
      ${JSON.stringify(simplifiedTransactions, null, 2)}
      `;

      try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: insightSchema,
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
      } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Falha ao gerar insights da IA.");
      }
    }
};

export default api;