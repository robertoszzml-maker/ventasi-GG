export const getColorFromString = (str: string): string => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-300',
    'bg-green-100 text-green-800 border-green-300',
    'bg-yellow-100 text-yellow-800 border-yellow-300',
    'bg-red-100 text-red-800 border-red-300',
    'bg-purple-100 text-purple-800 border-purple-300',
    'bg-pink-100 text-pink-800 border-pink-300',
    'bg-indigo-100 text-indigo-800 border-indigo-300',
    'bg-orange-100 text-orange-800 border-orange-300',
    'bg-teal-100 text-teal-800 border-teal-300',
    'bg-cyan-100 text-cyan-800 border-cyan-300',
    'bg-emerald-100 text-emerald-800 border-emerald-300',
    'bg-lime-100 text-lime-800 border-lime-300',
    'bg-amber-100 text-amber-800 border-amber-300',
    'bg-rose-100 text-rose-800 border-rose-300',
    'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    'bg-violet-100 text-violet-800 border-violet-300',
  ];

  // Longitud redondeada a decenas + primera letra
  const lengthRounded = Math.round(str.length / 10) * 10;
  const firstCharCode = str.charCodeAt(0);
  const hash = lengthRounded + firstCharCode;

  return colors[hash % colors.length];
};
