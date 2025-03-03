import { Subteams } from "@prisma/client";

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

export const reverseFormatSubteamName = (name: string) => {
    return name.replace(/ /g, '_').toUpperCase();
};  

export const getSubteamEnum = (subteamName: string): string => {
    const abbreviationMap: Record<string, Subteams> = {

        'aerodynamics': 'AERODYNAMICS',
        'battery': 'BATTERY',
        'business': 'BUSINESS',
        'chassis': 'CHASSIS',
        'distributed battery management': 'DISTRIBUTED_BATTERY_MANAGEMENT',
        'electronics': 'ELECTRONICS',
        'powertrain': 'POWERTRAIN',
        'software': 'SOFTWARE',
        'suspension': 'SUSPENSION',
        'finance': 'FINANCE',
        'marketing': 'MARKETING',
        'operations': 'OPERATIONS',
    };

    return abbreviationMap[subteamName] || subteamName;
};

export const getSubteamNameFromEnum = (subteamEnum: string): string => {
    const abbreviationMap: Record<string, string> = {
        'AERODYNAMICS': 'aerodynamics',
        'BATTERY': 'battery',
        'BUSINESS': 'business',
        'DISTRIBUTED_BATTERY_MANAGEMENT': 'distributed battery management',
        'ELECTRONICS': 'electronics',
        'POWERTRAIN': 'powertrain',
        'SOFTWARE': 'software',
        'SUSPENSION': 'suspension',
        'FINANCE': 'finance',
        'MARKETING': 'marketing',
        'OPERATIONS': 'operations',
    };

    return abbreviationMap[subteamEnum] || subteamEnum;
};
