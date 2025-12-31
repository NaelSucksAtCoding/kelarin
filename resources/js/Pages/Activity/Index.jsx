import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react'; // 🔥 Import usePage

export default function ActivityIndex({ auth, activities }) {
    // 🔥 AMBIL DATA GLOBAL (biar sidebar muncul walau controller gak ngirim)
    const { categories } = usePage().props; 

    // Helper Icon
    const getIcon = (type) => {
        switch(type) {
            case 'success': return <span className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 p-2 rounded-full text-xs">✨</span>;
            case 'danger': return <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-full text-xs">🗑️</span>;
            case 'warning': return <span className="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 p-2 rounded-full text-xs">✏️</span>;
            default: return <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-full text-xs">🔄</span>;
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // 🔥 LOGIC GROUPING BY DATE (JS MODERN)
    const groupedActivities = activities.data.reduce((groups, activity) => {
        const date = new Date(activity.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateKey = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // Logic "Hari Ini" & "Kemarin"
        if (date.toDateString() === today.toDateString()) {
            dateKey = "Hari Ini ☀️";
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateKey = "Kemarin 🕰️";
        }

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(activity);
        return groups;
    }, {});

    return (
        <AuthenticatedLayout
            user={auth.user}
            categories={categories} // Oper ke layout dari data global
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight">Riwayat Aktivitas 📜</h2>}
        >
            <Head title="Aktivitas" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 min-h-[500px]">
                        
                        <div className="mb-8 flex justify-between items-end border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Timeline Kegiatan</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Jejak digital produktivitasmu.</p>
                            </div>
                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">Auto-Log Active 🟢</span>
                        </div>

                        {/* LIST AKTIVITAS GROUPED */}
                        <div className="space-y-8">
                            {Object.keys(groupedActivities).length > 0 ? (
                                Object.entries(groupedActivities).map(([dateLabel, items]) => (
                                    <div key={dateLabel}>
                                        {/* HEADER TANGGAL (Sticky) */}
                                        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm py-2 mb-4">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 border-l-4 border-purple-500 pl-3">
                                                {dateLabel}
                                            </h4>
                                        </div>

                                        {/* ITEMS PER TANGGAL */}
                                        <div className="space-y-4 ml-2 border-l-2 border-gray-100 dark:border-gray-700 pl-6 pb-2 relative">
                                            {items.map((activity) => (
                                                <div key={activity.id} className="relative group">
                                                    {/* Dot Connector */}
                                                    <div className="absolute -left-[31px] top-3 w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800 group-hover:bg-purple-500 group-hover:scale-125 transition-all"></div>
                                                    
                                                    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <div className="mt-1 shrink-0">
                                                            {getIcon(activity.type)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">
                                                                {activity.description}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1 font-mono">
                                                                {formatTime(activity.created_at)} WIB
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 opacity-50">
                                    <p className="text-4xl mb-2">💤</p>
                                    <p className="text-gray-400">Belum ada jejak hari ini.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Simple */}
                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-2">
                            {activities.links.map((link, i) => (
                                link.url ? (
                                    <Link 
                                        key={i} 
                                        href={link.url} 
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${link.active ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : null
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}