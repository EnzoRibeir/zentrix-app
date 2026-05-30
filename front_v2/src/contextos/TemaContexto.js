import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CORES_CLARAS, CORES_ESCURAS } from '../constantes/cores';

const TemaContext = createContext();

export const TemaProvider = ({ children }) => {
  const scheme = useColorScheme(); // 'light' or 'dark' from the OS
  const [isEscuro, setIsEscuro] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Load saved preference
    const carregarTema = async () => {
      try {
        const temaSalvo = await AsyncStorage.getItem('@zentrix_tema');
        if (temaSalvo !== null) {
          setIsEscuro(temaSalvo === 'escuro');
        } else {
          // If no preference saved, use OS preference
          setIsEscuro(scheme === 'dark');
        }
      } catch (e) {
        console.error('Erro ao carregar tema:', e);
      } finally {
        setCarregando(false);
      }
    };
    carregarTema();
  }, [scheme]);

  const setTema = async (escuro) => {
    try {
      setIsEscuro(escuro);
      await AsyncStorage.setItem('@zentrix_tema', escuro ? 'escuro' : 'claro');
    } catch (e) {
      console.error('Erro ao salvar tema:', e);
    }
  };

  const alternarTema = () => {
    setTema(!isEscuro);
  };

  const CORES = isEscuro ? CORES_ESCURAS : CORES_CLARAS;

  if (carregando) return null; // Avoid flicker during init

  return (
    <TemaContext.Provider value={{ isEscuro, setTema, alternarTema, CORES }}>
      {children}
    </TemaContext.Provider>
  );
};

export const useTema = () => {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error('useTema deve ser usado dentro de um TemaProvider');
  }
  return contexto;
};
