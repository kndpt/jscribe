export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: diffDay > 365 ? 'numeric' : undefined 
    });
  } else if (diffDay > 0) {
    return `il y a ${diffDay} ${diffDay === 1 ? 'jour' : 'jours'}`;
  } else if (diffHour > 0) {
    return `il y a ${diffHour} ${diffHour === 1 ? 'heure' : 'heures'}`;
  } else if (diffMin > 0) {
    return `il y a ${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'}`;
  } else {
    return 'à l\'instant';
  }
}
