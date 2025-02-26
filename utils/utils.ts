export const getSubteamAbbreviation = (subteamName: string): string => {
    const abbreviationMap: Record<string, string> = {
        'SOFTWARE': 'SW',
        'DISTRIBUTED_BATTERY_MANAGEMENT': 'DBMS',
        'CHASSIS': 'CHS',
        'ELECTRONICS': 'ECE',
        'OPERATIONS': 'OPS',
        'SPONSOR_RELATIONS': 'SR',
        'MARKETING': 'MAR',
        'BUSINESS': 'BUS',
        'POWERTRAIN': 'PT',
        'BATTERY': 'BAT',
        'AERODYNAMICS': 'AERO',
        'SUSPENSION': 'SUS',
        'FINANCE': 'FIN'
    };

    return abbreviationMap[subteamName] || subteamName;
};