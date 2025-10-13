# Drum Rudiments Practice

Aplicativo web para prática de rudimentos de bateria com sequenciador musical interativo.

## 🥁 Funcionalidades

- **Tipos de Notas:** Quarter, Eighth, Triplet, Sixteenth, Thirty-second
- **Padrões de Mão:** R (Right), L (Left), K (Kick) personalizáveis
- **Controle de BPM:** 40-200 BPM ajustável
- **Sequências Aleatórias:** Geração automática com 32 stems
- **Áudio Interativo:** Sons diferenciados para cada tipo de mão
- **Modo Escuro/Claro:** Interface adaptável
- **Switches de Controle:** Random Rest, Drum Kick, Sound, Click

## 🚀 Como Executar

### Frontend
```bash
cd frontend
yarn install
yarn start
```

### Backend (Opcional)
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

## 🛠️ Stack Tecnológica

- **Frontend:** React 19, Tailwind CSS, ShadCN/UI
- **Backend:** FastAPI, MongoDB
- **Áudio:** Web Audio API
- **Build:** CRACO, Webpack

## 📱 Uso

1. **Adicione notas** clicando nos botões de tipo de nota
2. **Modifique padrões de mão** clicando nos botões de hand pattern
3. **Ajuste o BPM** usando o slider
4. **Ative Drum Kick** para incluir padrões com K
5. **Use Random Rest** para incluir pausas nas sequências aleatórias
6. **Pressione Play** para ouvir sua sequência

## 🎵 Controles

- **Random Rest:** Inclui pausas nas sequências aleatórias
- **Drum Kick:** Adiciona padrões de kick drum (K) aos hand patterns
- **Sound:** Liga/desliga sons de bateria
- **Click:** Liga/desliga som do metrônomo

Desenvolvido com ❤️ usando Emergent