export const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // Đổi ra giây

    if (diff < 60) return `${diff} sec`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours`;
    return `${Math.floor(diff / 86400)} days`;
};
