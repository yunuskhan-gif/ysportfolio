export interface ICompany {
    id: string;
    name: string;
    logo: string;
    theme: string;
    getLogoPath(isDarkMode: boolean): string;
    getDisplayName(): string;
}

export abstract class BaseCompany implements ICompany {
    public id: string;
    public name: string;
    public logo: string;
    public theme: string;

    constructor(id: string, name: string, logo: string, theme: string) {
        this.id = id;
        this.name = name;
        this.logo = logo;
        this.theme = theme;
    }

    getLogoPath(isDarkMode: boolean): string {
        if (this.id === "default") {
            return isDarkMode ? "/white-logo.png" : "/blacklogo.png";
        }
        const logoType = isDarkMode ? "dark" : "light";
        return `/logos/${this.logo}-${logoType}.png`;
    }

    getDisplayName(): string {
        return this.name;
    }
}

export class MoneydialCompany extends BaseCompany {
    constructor() {
        super("moneydial", "Moneydial", "moneydial", "moneydial");
    }
}

export class TradyticsCompany extends BaseCompany {
    constructor() {
        super("tradytics", "Tradytics", "tradytics", "violet-bloom");
    }
}

export class DefaultCompany extends BaseCompany {
    constructor() {
        super("default", "YS Portfolio", "default", "default");
    }
}

export class CompanyFactory {
    private static companies: Map<string, new () => BaseCompany> = new Map();

    static initialize(): void {
        this.companies.set("moneydial", MoneydialCompany);
        this.companies.set("tradytics", TradyticsCompany);
    }

    static createCompany(companyId: string): BaseCompany {
        const CompanyClass = this.companies.get(companyId);
        if (CompanyClass) {
            return new CompanyClass();
        }
        return new DefaultCompany();
    }

    static registerCompany(id: string, companyClass: new () => BaseCompany): void {
        this.companies.set(id, companyClass);
    }

    static getAllCompanies(): BaseCompany[] {
        const companies: BaseCompany[] = [];
        this.companies.forEach((CompanyClass) => {
            companies.push(new CompanyClass());
        });
        return companies;
    }
}

CompanyFactory.initialize();