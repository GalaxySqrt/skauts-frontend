import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly LANGUAGE_KEY = 'selected_language';
    private currentLanguageSubject = new BehaviorSubject<string>('pt');
    currentLanguage$ = this.currentLanguageSubject.asObservable();

    constructor(private translate: TranslateService) {
        this.initLanguage();
    }

    private initLanguage() {
        this.translate.addLangs(['en', 'pt', 'es']);
        const savedLang = localStorage.getItem(this.LANGUAGE_KEY);
        const browserLang = this.translate.getBrowserLang();
        let langToUse = 'pt';

        if (savedLang && ['en', 'pt', 'es'].includes(savedLang)) {
            langToUse = savedLang;
        } else if (browserLang) {
            const shortLang = browserLang.split('-')[0];
            if (['en', 'pt', 'es'].includes(shortLang)) {
                langToUse = shortLang;
            }
        }

        this.setLanguage(langToUse);
    }

    setLanguage(lang: string) {
        this.translate.use(lang);
        localStorage.setItem(this.LANGUAGE_KEY, lang);
        this.currentLanguageSubject.next(lang);
    }

    getCurrentLanguage(): string {
        return this.currentLanguageSubject.value;
    }
}
